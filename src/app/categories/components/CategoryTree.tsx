"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import type { Category } from "@/gen/arian/v1/category_pb";
import { CategoryItem } from "./CategoryItem";
import {
  type CategoryNode,
  type PendingChange,
  getDisplayName,
  calculateDropResult,
  findInsertionIndex,
  createMoveChanges,
  getCategoryTree,
} from "../utils/categoryUtils";
import { CategoryDisplay } from "./CategoryDisplay";

interface CategoryTreeProps {
  categoryTree: CategoryNode[];
  categories: Category[];
  pendingChanges: PendingChange[];
  onCategoryMove: (changes: PendingChange[]) => void;
  onDelete: (category: Category) => void;
}

interface DragState {
  activeId: string | null;
  overId: string | null;
  nestingLevel: number;
}

const NESTING_THRESHOLD = 20;
const INITIAL_DRAG_STATE: DragState = { activeId: null, overId: null, nestingLevel: 0 };

export function CategoryTree({ categoryTree, categories, pendingChanges, onCategoryMove, onDelete }: CategoryTreeProps) {
  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG_STATE);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  // Custom collision detection for better hierarchical drag and drop
  const customCollisionDetection = (args: any) => {
    // First try pointer within - most precise
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Then try rectangle intersection for larger targets
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // Finally fall back to closest corners
    return closestCorners(args);
  };

  const resetDragState = () => setDragState(INITIAL_DRAG_STATE);
  const findCategory = (id: string) => categories.find(c => c.id.toString() === id);

  const handleDragStart = (event: DragStartEvent) => {
    setDragState(prev => ({ ...prev, activeId: event.active.id as string }));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, delta } = event;

    if (!over) {
      setDragState(prev => ({ ...prev, overId: null }));
      return;
    }

    const targetId = over.id as string;
    const nestingChange = Math.floor(delta.x / NESTING_THRESHOLD);
    const targetCategory = findCategory(targetId);
    const targetLevel = (targetCategory?.slug.split('.').length ?? 1) - 1;
    const newNestingLevel = Math.max(0, targetLevel + nestingChange);

    setDragState(prev => ({ ...prev, overId: targetId, nestingLevel: newNestingLevel }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (!over || !dragState.activeId) {
      resetDragState();
      return;
    }

    const draggedCategory = findCategory(dragState.activeId);
    if (!draggedCategory) {
      resetDragState();
      return;
    }

    const newSlug = dragState.nestingLevel === 0
      ? getDisplayName(draggedCategory.slug)
      : (() => {
          const targetCategory = findCategory(over.id as string);
          if (!targetCategory || draggedCategory.id === targetCategory.id) return null;
          return calculateDropResult(draggedCategory, targetCategory, dragState.nestingLevel).newSlug;
        })();

    if (!newSlug || newSlug === draggedCategory.slug) {
      resetDragState();
      return;
    }

    onCategoryMove(createMoveChanges(draggedCategory, newSlug, categories));
    resetDragState();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2 min-h-[200px] p-4 rounded-md">
        {categoryTree.length === 0 ? (
          <div className="text-sm tui-muted text-center py-12">
            No categories yet. Create your first category above.
          </div>
        ) : (
          <CategoryTreeItems
            categoryTree={categoryTree}
            dragState={dragState}
            categories={categories}
            pendingChanges={pendingChanges}
            onDelete={onDelete}
          />
        )}
      </div>

      <DragOverlay adjustScale={false}>
        {dragState.activeId && (
          <DraggedItemOverlay draggedCategoryId={dragState.activeId} categories={categories} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Renders the category tree with root preview logic
function CategoryTreeItems({
  categoryTree,
  dragState,
  categories,
  pendingChanges,
  onDelete
}: {
  categoryTree: CategoryNode[];
  dragState: DragState;
  categories: Category[];
  pendingChanges: PendingChange[];
  onDelete: (category: Category) => void;
}) {
  const showRootPreview = dragState.nestingLevel === 0 && dragState.activeId;

  if (showRootPreview) {
    const draggedCategory = categories.find(c => c.id.toString() === dragState.activeId);
    if (draggedCategory) {
      const filteredTree = categoryTree.filter(node => node.category.id.toString() !== dragState.activeId);
      const draggedDisplayName = getDisplayName(draggedCategory.slug);
      const insertIndex = findInsertionIndex(filteredTree, draggedDisplayName, node => getDisplayName(node.category.slug));

      const itemsWithPreview = [...filteredTree];
      itemsWithPreview.splice(insertIndex, 0, { isPreview: true, category: draggedCategory } as any);

      return (
        <>
          {itemsWithPreview.map((item, index) => {
            if ((item as any).isPreview) {
              return (
                <div key="root-preview" className="opacity-70 mb-2">
                  <CategoryDisplay
                    category={draggedCategory}
                    displayName={draggedDisplayName}
                    slug={draggedDisplayName}
                    isPreview
                  >
                    <button className="opacity-0 p-2 rounded-md text-red-500">✕</button>
                  </CategoryDisplay>
                </div>
              );
            }

            const node = item as CategoryNode;
            return (
              <CategoryItem
                key={node.category.id.toString()}
                node={node}
                pendingChanges={pendingChanges}
                dragState={dragState}
                categories={categories}
                onDelete={onDelete}
              />
            );
          })}
        </>
      );
    }
  }

  // Filter out dragged items and their children even during normal rendering
  const filteredTree = dragState.activeId
    ? categoryTree.filter(node => {
        const draggedCategory = categories.find(c => c.id.toString() === dragState.activeId);
        if (!draggedCategory) return true;

        // Exclude the dragged item itself
        if (node.category.id.toString() === dragState.activeId) return false;

        // Exclude children of the dragged item
        return !node.category.slug.startsWith(draggedCategory.slug + '.');
      })
    : categoryTree;

  return (
    <>
      {filteredTree.map((node) => (
        <CategoryItem
          key={node.category.id.toString()}
          node={node}
          pendingChanges={pendingChanges}
          dragState={dragState}
          categories={categories}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

// Drag overlay component - shows entire tree being dragged
function DraggedItemOverlay({ draggedCategoryId, categories }: { draggedCategoryId: string; categories: Category[] }) {
  const category = categories.find(c => c.id.toString() === draggedCategoryId);
  if (!category) return null;

  const draggedTree = getCategoryTree(category, categories);

  return (
    <div className="space-y-2">
      <DraggedTreeNode node={draggedTree} />
    </div>
  );
}

// Recursive component to render dragged tree
function DraggedTreeNode({ node }: { node: CategoryNode }) {
  return (
    <div>
      <CategoryDisplay
        category={node.category}
        className="shadow-xl opacity-90"
      />
      {node.children.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {node.children.map((child) => (
            <DraggedTreeNode key={child.category.id.toString()} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}