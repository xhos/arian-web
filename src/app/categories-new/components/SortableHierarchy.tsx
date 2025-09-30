"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";
import { ItemOverlay } from "./ItemOverlay";
import { flattenTree, buildTree, removeChildrenOf, getProjection } from "../utils/tree";

export interface TreeItem {
  id: string;
  name: string;
  color: string;
  children: TreeItem[];
}

export interface FlattenedItem extends TreeItem {
  parentId: string | null;
  depth: number;
  index: number;
}

interface SortableHierarchyProps {
  items: TreeItem[];
  onItemsChange: (items: TreeItem[]) => void;
}

const measuring = {
  droppable: {
    strategy: "always" as const,
  },
};

export function SortableHierarchy({ items, onItemsChange }: SortableHierarchyProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flattenedItems = flattenTree(items);
  const projected =
    activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, 50) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedIds = flattenedItems.map(({ id }) => id);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
    setOverId(active.id as string);

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: { over: { id: string } | null }) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = flattenTree(items);
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      const newItems = arrayMove(clonedItems, activeIndex, overIndex);

      const finalItems = buildTree(
        newItems.map((item) => {
          if (item.id === activeTreeItem.id) {
            return { ...item, depth, parentId };
          }
          return item;
        })
      );

      onItemsChange(finalItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty("cursor", "");
  }

  const adjustedTree = removeChildrenOf(flattenedItems, activeId ? [activeId] : []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {adjustedTree.map(({ id, ...props }) => (
            <SortableItem
              key={id}
              id={id}
              depth={id === activeId && projected ? projected.depth : props.depth}
              {...props}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeId ? <ItemOverlay id={activeId} items={flattenedItems} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);

  return newArray;
}
