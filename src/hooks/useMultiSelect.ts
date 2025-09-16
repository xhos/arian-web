import { useState, useCallback, useEffect } from "react";

interface UseMultiSelectOptions<T> {
  items: T[];
  getId: (item: T) => string | bigint;
}

export function useMultiSelect<T>({ items, getId }: UseMultiSelectOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback((id: string | bigint) => {
    return selectedIds.has(id.toString());
  }, [selectedIds]);

  const toggleSelection = useCallback((
    id: string | bigint, 
    index: number, 
    event?: React.MouseEvent
  ) => {
    const idStr = id.toString();
    
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Range selection with Shift
      const startIndex = Math.min(lastSelectedIndex, index);
      const endIndex = Math.max(lastSelectedIndex, index);
      
      const newSelectedIds = new Set(selectedIds);
      
      for (let i = startIndex; i <= endIndex; i++) {
        if (i < items.length) {
          newSelectedIds.add(getId(items[i]).toString());
        }
      }
      
      setSelectedIds(newSelectedIds);
    } else if (event?.ctrlKey || event?.metaKey) {
      // Toggle individual selection with Ctrl/Cmd
      const newSelectedIds = new Set(selectedIds);
      
      if (newSelectedIds.has(idStr)) {
        newSelectedIds.delete(idStr);
      } else {
        newSelectedIds.add(idStr);
      }
      
      setSelectedIds(newSelectedIds);
      setLastSelectedIndex(index);
    } else {
      // Single selection (clear others)
      if (selectedIds.has(idStr) && selectedIds.size === 1) {
        // If only this item is selected, deselect it
        setSelectedIds(new Set());
        setLastSelectedIndex(null);
      } else {
        // Select only this item
        setSelectedIds(new Set([idStr]));
        setLastSelectedIndex(index);
      }
    }
  }, [selectedIds, lastSelectedIndex, items, getId]);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(getId(item).toString()));
  }, [items, selectedIds, getId]);

  const hasSelection = selectedIds.size > 0;
  const selectedCount = selectedIds.size;

  // Reset selection when items change significantly
  useEffect(() => {
    const itemIds = new Set(items.map(item => getId(item).toString()));
    const validSelectedIds = new Set(
      Array.from(selectedIds).filter(id => itemIds.has(id))
    );
    
    if (validSelectedIds.size !== selectedIds.size) {
      setSelectedIds(validSelectedIds);
      if (validSelectedIds.size === 0) {
        setLastSelectedIndex(null);
      }
    }
  }, [items, selectedIds, getId]);

  const selectItems = useCallback((itemIds: (string | bigint)[]) => {
    const newSelectedIds = new Set(selectedIds);
    itemIds.forEach(id => newSelectedIds.add(id.toString()));
    setSelectedIds(newSelectedIds);
  }, [selectedIds]);

  const deselectItems = useCallback((itemIds: (string | bigint)[]) => {
    const newSelectedIds = new Set(selectedIds);
    itemIds.forEach(id => newSelectedIds.delete(id.toString()));
    setSelectedIds(newSelectedIds);
  }, [selectedIds]);

  const toggleItems = useCallback((itemIds: (string | bigint)[]) => {
    const itemIdStrings = itemIds.map(id => id.toString());
    const allSelected = itemIdStrings.every(id => selectedIds.has(id));
    
    if (allSelected) {
      deselectItems(itemIds);
    } else {
      selectItems(itemIds);
    }
  }, [selectedIds, selectItems, deselectItems]);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    clearSelection,
    getSelectedItems,
    hasSelection,
    selectedCount,
    selectItems,
    deselectItems,
    toggleItems,
  };
}