import type { Category } from "@/gen/arian/v1/category_pb";

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  level: number;
}

export interface PendingChange {
  categoryId: bigint;
  newSlug: string;
  oldSlug: string;
}

export function getDisplayName(slug: string): string {
  const parts = slug.split('.');
  return parts[parts.length - 1];
}

export function getParentSlug(slug: string): string | null {
  const lastDotIndex = slug.lastIndexOf('.');
  return lastDotIndex > 0 ? slug.substring(0, lastDotIndex) : null;
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  categories.forEach(category => {
    categoryMap.set(category.slug, {
      category,
      children: [],
      level: category.slug.split('.').length - 1
    });
  });

  categories.forEach(category => {
    const node = categoryMap.get(category.slug)!;
    const parentSlug = getParentSlug(category.slug);

    if (parentSlug && categoryMap.has(parentSlug)) {
      categoryMap.get(parentSlug)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
    nodes.sort((a, b) => getDisplayName(a.category.slug).localeCompare(getDisplayName(b.category.slug)));
    nodes.forEach(node => {
      node.children = sortNodes(node.children);
    });
    return nodes;
  };

  return sortNodes(rootNodes);
}

export function generateRandomColor(): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate where a dragged category will end up when dropped
export function calculateDropResult(
  draggedCategory: Category,
  targetCategory: Category,
  horizontalNestingLevel: number
): { newSlug: string; actualLevel: number } {
  const draggedName = getDisplayName(draggedCategory.slug);
  const targetLevel = targetCategory.slug.split('.').length - 1;

  let actualLevel: number;
  let newSlug: string;

  if (horizontalNestingLevel === 0) {
    // Root level
    actualLevel = 0;
    newSlug = draggedName;
  } else if (horizontalNestingLevel > targetLevel) {
    // Nesting inside target (becomes child)
    actualLevel = targetLevel + 1;
    newSlug = `${targetCategory.slug}.${draggedName}`;
  } else {
    // Same level or higher - find parent at desired level
    const targetParts = targetCategory.slug.split('.');
    const parentParts = targetParts.slice(0, horizontalNestingLevel);
    actualLevel = horizontalNestingLevel;
    newSlug = parentParts.length > 0 ? `${parentParts.join('.')}.${draggedName}` : draggedName;
  }

  return { newSlug, actualLevel };
}

// Shared styles for consistent category display
export const categoryDisplayStyles = {
  container: "flex items-center gap-3 flex-1",
  iconContainer: "flex items-center gap-3",
  grabHandle: "flex flex-col gap-0.5 opacity-40",
  grabDot: "w-2 h-1 bg-current rounded-full",
  collapseIcon: "w-5 h-5 flex items-center justify-center text-xs opacity-60",
  colorDot: "w-5 h-5 rounded-full flex-shrink-0",
  categoryName: "flex-1 text-sm font-medium tui-foreground capitalize",
  categorySlug: "text-xs tui-muted font-mono"
};

// Helper to find alphabetical insertion index
export function findInsertionIndex<T>(items: T[], newItem: string, getDisplayName: (item: T) => string): number {
  for (let i = 0; i < items.length; i++) {
    if (newItem.localeCompare(getDisplayName(items[i])) < 0) {
      return i;
    }
  }
  return items.length;
}

// Create move changes for category and its children
export function createMoveChanges(draggedCategory: Category, newSlug: string, categories: Category[]): PendingChange[] {
  const changes: PendingChange[] = [{
    categoryId: draggedCategory.id,
    newSlug,
    oldSlug: draggedCategory.slug,
  }];

  // Add changes for children
  categories
    .filter(cat => cat.slug.startsWith(draggedCategory.slug + '.') && cat.id !== draggedCategory.id)
    .forEach(child => {
      const relativePath = child.slug.substring(draggedCategory.slug.length);
      changes.push({
        categoryId: child.id,
        newSlug: newSlug + relativePath,
        oldSlug: child.slug,
      });
    });

  return changes;
}

// Get all children of a category (recursive)
export function getCategoryTree(parentCategory: Category, allCategories: Category[]): CategoryNode {
  const children = allCategories
    .filter(cat => {
      const parentSlug = getParentSlug(cat.slug);
      return parentSlug === parentCategory.slug;
    })
    .map(child => getCategoryTree(child, allCategories))
    .sort((a, b) => getDisplayName(a.category.slug).localeCompare(getDisplayName(b.category.slug)));

  return {
    category: parentCategory,
    children,
    level: parentCategory.slug.split('.').length - 1
  };
}

// Sortable-specific types and utilities
export interface FlatCategoryItem {
  id: string;
  category: Category;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  isCollapsed?: boolean;
}

// Convert hierarchical categories to flat sortable structure
export function categoriesToFlatSortable(categories: Category[]): FlatCategoryItem[] {
  const items: FlatCategoryItem[] = [];

  // Create a map for quick parent lookup
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => categoryMap.set(cat.slug, cat));

  // Sort categories by slug to ensure proper hierarchical order
  const sortedCategories = [...categories].sort((a, b) => a.slug.localeCompare(b.slug));

  sortedCategories.forEach(category => {
    const level = category.slug.split('.').length - 1;
    const parentSlug = getParentSlug(category.slug);
    const parentCategory = parentSlug ? categoryMap.get(parentSlug) : null;
    const hasChildren = categories.some(cat =>
      cat.slug.startsWith(category.slug + '.') && cat.slug !== category.slug
    );

    items.push({
      id: category.id.toString(),
      category,
      level,
      parentId: parentCategory ? parentCategory.id.toString() : null,
      hasChildren,
      isCollapsed: false,
    });
  });

  return items;
}

// Get all descendants of a category
export function getCategoryDescendants(categorySlug: string, categories: Category[]): Category[] {
  return categories.filter(cat =>
    cat.slug.startsWith(categorySlug + '.') && cat.slug !== categorySlug
  );
}

// Check if a category can be nested under another (prevent circular references)
export function canNestCategory(
  draggedCategory: Category,
  targetCategory: Category,
  categories: Category[]
): boolean {
  // Can't nest under self
  if (draggedCategory.id === targetCategory.id) return false;

  // Can't nest under own descendant (would create circular reference)
  const descendants = getCategoryDescendants(draggedCategory.slug, categories);
  if (descendants.some(desc => desc.id === targetCategory.id)) return false;

  return true;
}

// Calculate new slug when moving a category to a new position
export function calculateNewSlugForSortable(
  draggedItem: FlatCategoryItem,
  overItem: FlatCategoryItem,
  nestingIntent: 'same-level' | 'nest-under' | 'root-level',
  categories: Category[]
): string {
  const draggedName = getDisplayName(draggedItem.category.slug);

  switch (nestingIntent) {
    case 'root-level':
      return draggedName;

    case 'nest-under':
      if (!canNestCategory(draggedItem.category, overItem.category, categories)) {
        // Fall back to same level if nesting not allowed
        return calculateNewSlugForSortable(draggedItem, overItem, 'same-level', categories);
      }
      return `${overItem.category.slug}.${draggedName}`;

    case 'same-level':
    default:
      if (overItem.level === 0) {
        return draggedName;
      } else {
        const parentSlug = getParentSlug(overItem.category.slug);
        return parentSlug ? `${parentSlug}.${draggedName}` : draggedName;
      }
  }
}

// Determine nesting intent based on drag behavior
export function determineNestingIntent(
  draggedItem: FlatCategoryItem,
  overItem: FlatCategoryItem,
  modifiers?: { horizontalOffset?: number }
): 'same-level' | 'nest-under' | 'root-level' {
  const horizontalOffset = modifiers?.horizontalOffset || 0;

  // If dragging significantly right, try to nest under target
  if (horizontalOffset > 20) {
    return 'nest-under';
  }

  // If dragging significantly left, try to move to root or higher level
  if (horizontalOffset < -20) {
    return overItem.level > 0 ? 'root-level' : 'same-level';
  }

  // Default: same level as target (unless dragged item is already at root and target isn't)
  if (draggedItem.level === 0 && overItem.level > 0) {
    return 'same-level';
  }

  return 'same-level';
}