"use client";

import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "@/gen/arian/v1/category_pb";
import {
  type CategoryNode,
  type PendingChange,
  getDisplayName,
  calculateDropResult,
  findInsertionIndex,
  categoryDisplayStyles,
} from "../utils/categoryUtils";
import { CategoryDisplay } from "./CategoryDisplay";

interface DragState {
  activeId: string | null;
  overId: string | null;
  nestingLevel: number;
}

interface PreviewItem {
  isPreview: true;
  displayName: string;
  category?: Category;
  newSlug: string;
  actualLevel: number;
}

type ChildItem = CategoryNode | PreviewItem;

interface CategoryItemProps {
  node: CategoryNode;
  pendingChanges: PendingChange[];
  dragState: DragState;
  categories: Category[];
  onDelete: (category: Category) => void;
  isOverlay?: boolean;
}

export function CategoryItem({ node, pendingChanges, dragState, categories, onDelete, isOverlay = false }: CategoryItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dragId = node.category.id.toString();
  const hasChanges = pendingChanges.some(change => change.categoryId === node.category.id);
  const isDragging = dragState.activeId === dragId;
  const isDropTarget = dragState.overId === dragId;

  // Check if this category or any ancestor is being dragged
  const draggedCategory = dragState.activeId ? categories.find(c => c.id.toString() === dragState.activeId) : null;
  const isChildOfDragged = draggedCategory && node.category.slug.startsWith(draggedCategory.slug + '.');
  const shouldHide = isDragging || isChildOfDragged;

  // Draggable setup
  const draggable = useDraggable({
    id: dragId,
    data: { category: node.category, type: 'category' }
  });

  // Droppable setup
  const droppable = useDroppable({
    id: dragId,
    data: { category: node.category },
    disabled: false
  });

  const style = draggable.transform ? {
    transform: CSS.Transform.toString(draggable.transform),
  } : undefined;

  // Show nesting preview when this item is a drop target
  const showNestingPreview = isDropTarget && dragState.activeId && dragState.activeId !== dragId;

  // Calculate the actual resulting nesting level and slug using shared logic
  const previewInfo = (() => {
    if (!showNestingPreview || !dragState.activeId) return { actualLevel: 0, newSlug: '' };

    const draggedCategory = categories.find(c => c.id.toString() === dragState.activeId);
    if (!draggedCategory) return { actualLevel: 0, newSlug: '' };

    return calculateDropResult(draggedCategory, node.category, dragState.nestingLevel);
  })();

  return (
    <div className="relative">
      {/* Main category item */}
      <div
        ref={(element) => {
          draggable.setNodeRef(element);
          droppable.setNodeRef(element);
        }}
        style={style}
        className={`relative transition-all ${
          shouldHide ? 'opacity-0' : ''
        }`}
      >
        <div
          className={`group flex items-center gap-3 p-3 tui-border rounded-md transition-all cursor-pointer ${
            hasChanges ? 'border-yellow-400 bg-yellow-500/10' : 'tui-background hover:opacity-80'
          } ${isOverlay ? 'shadow-2xl' : ''}`}
          style={{ marginLeft: `${node.level * 24}px` }}
          onClick={() => node.children.length > 0 && setIsCollapsed(!isCollapsed)}
        >
          {/* Drag handle and content */}
          <div className={categoryDisplayStyles.container}>
            <div
              className={`${categoryDisplayStyles.grabHandle} cursor-grab hover:opacity-70 transition-opacity p-2 -m-2 rounded-md`}
              {...draggable.listeners}
              {...draggable.attributes}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={categoryDisplayStyles.grabDot}></div>
              <div className={categoryDisplayStyles.grabDot}></div>
              <div className={categoryDisplayStyles.grabDot}></div>
            </div>

            <div className={categoryDisplayStyles.iconContainer}>
              {node.children.length > 0 && (
                <div className={categoryDisplayStyles.collapseIcon}>
                  {isCollapsed ? '▶' : '▼'}
                </div>
              )}
              <div
                className={categoryDisplayStyles.colorDot}
                style={{ backgroundColor: node.category.color }}
              />
            </div>

            <span className={categoryDisplayStyles.categoryName}>
              {getDisplayName(node.category.slug)}
            </span>

            <span className={categoryDisplayStyles.categorySlug}>
              {node.category.slug}
            </span>
          </div>

          {/* Delete button */}
          {!shouldHide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.category);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-md text-red-500 hover:text-red-600"
              title="Delete category"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {!isCollapsed && (
        <div className="mt-2 space-y-2">
          {(() => {
            // Create a list with existing children and the preview item for proper sorting
            // Filter out the dragged category to avoid showing both original (invisible) and preview
            const children: ChildItem[] = node.children.filter(child =>
              child.category.id.toString() !== dragState.activeId
            );

            // Add preview item if it should be shown as a child
            const shouldShowPreview = showNestingPreview && previewInfo.actualLevel > node.level;
            if (shouldShowPreview && dragState.activeId) {
              const draggedDisplayName = previewInfo.newSlug.split('.').pop() || '';
              const previewItem: PreviewItem = {
                isPreview: true,
                displayName: draggedDisplayName,
                category: categories.find(c => c.id.toString() === dragState.activeId),
                newSlug: previewInfo.newSlug,
                actualLevel: previewInfo.actualLevel
              };

              // Find the correct position to insert the preview based on alphabetical order
              let insertIndex = 0;
              for (let i = 0; i < children.length; i++) {
                const child = children[i] as CategoryNode;
                const childDisplayName = getDisplayName(child.category.slug);
                if (draggedDisplayName.localeCompare(childDisplayName) < 0) {
                  break;
                }
                insertIndex = i + 1;
              }

              children.splice(insertIndex, 0, previewItem);
            }

            return children.map((child) => {
              // Render preview item
              if ('isPreview' in child && child.isPreview) {
                return (
                  <div
                    key="preview"
                    className="opacity-70"
                    style={{ marginLeft: `${child.actualLevel * 24}px` }}
                  >
                    <CategoryDisplay
                      category={child.category || { color: '#666' } as Category}
                      displayName={child.displayName}
                      slug={child.newSlug}
                      isPreview
                      className="group"
                    >
                      <button className="opacity-0 p-2 rounded-md text-red-500">✕</button>
                    </CategoryDisplay>
                  </div>
                );
              }

              // Render normal child
              const categoryNode = child as CategoryNode;
              return (
                <CategoryItem
                  key={categoryNode.category.id.toString()}
                  node={categoryNode}
                  pendingChanges={pendingChanges}
                  dragState={dragState}
                  categories={categories}
                  onDelete={onDelete}
                />
              );
            });
          })()}
        </div>
      )}

    </div>
  );
}