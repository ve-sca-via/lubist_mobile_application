import { ServiceCategoryNode, VendorService } from '@/services/api/hooks/useVendorAPI';

/**
 * A service row only stores `category_id` + the DEEPEST `subcategory_id`
 * (could be a level-2 subcategory or a level-3 sub-subcategory). This index
 * walks the category tree once so a service can be resolved back to its
 * full display path without a lookup per row.
 */
export interface ResolvedTaxonomy {
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subSubcategoryId?: string;
  subSubcategoryName?: string;
}

export type TaxonomyIndex = Map<string, ResolvedTaxonomy>;

/** Builds an `id -> resolved path` map keyed by every subcategory/sub-subcategory id in the tree. */
export function buildTaxonomyIndex(categories: ServiceCategoryNode[]): TaxonomyIndex {
  const index: TaxonomyIndex = new Map();

  for (const category of categories) {
    for (const level2 of category.subcategories ?? []) {
      index.set(level2.id, {
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: level2.id,
        subcategoryName: level2.name,
      });

      for (const level3 of level2.subcategories ?? []) {
        index.set(level3.id, {
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: level2.id,
          subcategoryName: level2.name,
          subSubcategoryId: level3.id,
          subSubcategoryName: level3.name,
        });
      }
    }
  }

  return index;
}

/** Resolves a service's `category_id`/`subcategory_id` to a display path via the index. */
export function resolveServiceTaxonomy(
  service: Pick<VendorService, 'category_id' | 'subcategory_id'>,
  index: TaxonomyIndex,
): ResolvedTaxonomy | undefined {
  if (service.subcategory_id) {
    const resolved = index.get(service.subcategory_id);
    if (resolved) return resolved;
  }
  return undefined;
}

/** "Hair › Haircut › Spanish Haircut" style label, skipping any missing levels. */
export function formatTaxonomyLabel(resolved: ResolvedTaxonomy | undefined): string {
  if (!resolved) return '';
  return [resolved.categoryName, resolved.subcategoryName, resolved.subSubcategoryName]
    .filter(Boolean)
    .join(' › ');
}
