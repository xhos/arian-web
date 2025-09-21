"use client";

import type { Category } from "@/gen/arian/v1/category_pb";
import { getDisplayName, categoryDisplayStyles } from "../utils/categoryUtils";

interface CategoryDisplayProps {
  category: Category;
  displayName?: string;
  slug?: string;
  isPreview?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function CategoryDisplay({
  category,
  displayName,
  slug,
  isPreview = false,
  className = "",
  style,
  children
}: CategoryDisplayProps) {
  const name = displayName || getDisplayName(category.slug);
  const slugText = slug || category.slug;

  const baseClasses = `flex items-center gap-3 p-3 rounded-md ${
    isPreview
      ? 'border-2 border-dashed border-blue-500/50 bg-blue-500/10'
      : 'tui-border tui-background'
  }`;

  return (
    <div className={`${baseClasses} ${className}`} style={style}>
      <div className={categoryDisplayStyles.container}>
        <div className={categoryDisplayStyles.iconContainer}>
          <div className={`${categoryDisplayStyles.grabHandle} p-2 -m-2 rounded-md`}>
            <div className={categoryDisplayStyles.grabDot}></div>
            <div className={categoryDisplayStyles.grabDot}></div>
            <div className={categoryDisplayStyles.grabDot}></div>
          </div>
          <div
            className={categoryDisplayStyles.colorDot}
            style={{ backgroundColor: category.color }}
          />
        </div>
        <span className={categoryDisplayStyles.categoryName}>{name}</span>
        <span className={categoryDisplayStyles.categorySlug}>{slugText}</span>
      </div>
      {children}
    </div>
  );
}