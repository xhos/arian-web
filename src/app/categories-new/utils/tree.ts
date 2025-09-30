import { FlattenedItem, TreeItem } from "../components/SortableHierarchy";

export function flattenTree(
  items: TreeItem[],
  parentId: string | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItem[] {
  const root: TreeItem[] = [];
  const nodes: Record<string, TreeItem> = {};

  // First pass: create all nodes
  for (const item of flattenedItems) {
    nodes[item.id] = {
      id: item.id,
      name: item.name,
      color: item.color,
      children: [],
    };
  }

  // Second pass: build the tree structure
  for (const item of flattenedItems) {
    const node = nodes[item.id];

    if (item.parentId === null) {
      root.push(node);
    } else {
      const parent = nodes[item.parentId];
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]): FlattenedItem[] {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (ids.includes(item.id)) {
      if (item.children.length) {
        excludeParentIds.push(...getDescendantIds(items, item.id));
      }
      return false;
    }

    return !excludeParentIds.includes(item.parentId!);
  });
}

export function getDescendantIds(items: FlattenedItem[], id: string): string[] {
  const descendants: string[] = [];

  for (const item of items) {
    if (item.parentId === id) {
      descendants.push(item.id);
      descendants.push(...getDescendantIds(items, item.id));
    }
  }

  return descendants;
}

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  return previousItem ? previousItem.depth + 1 : 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  return nextItem ? nextItem.depth : 0;
}

export function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = items.slice();
  const nextItem = newItems[overItemIndex + 1];
  const previousItem = newItems[overItemIndex - 1];

  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }

  return { depth, parentId: getParentId() };
}
