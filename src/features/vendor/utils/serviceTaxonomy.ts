import { ServiceCategoryNode, VendorService } from '@/services/api/hooks/useVendorAPI';

/**
 * A service row only stores `category_id` + the DEEPEST `subcategory_id`
 * (could be a level-2 subcategory or a level-3 sub-subcategory). These
 * helpers walk the category tree once so a service can be resolved back to
 * its full display path — and grouped/sorted — without a lookup per row.
 * Mirrors salon-management-app/src/components/vendor/services/serviceTaxonomy.js.
 */

export const UNCATEGORISED_LABEL = 'Other Services';
export const NO_SUBCATEGORY_LABEL = 'General';

export interface ResolvedTaxonomy {
  categoryId: string | null;
  categoryName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  subSubcategoryId: string | null;
  subSubcategoryName: string | null;
}

export interface TaxonomyIndex {
  byNode: Map<string, ResolvedTaxonomy>;
  byCategory: Map<string, ServiceCategoryNode>;
  categoryOrder: Map<string, number>;
}

/** Builds id -> resolved-path lookups, keyed by every subcategory/sub-subcategory id in the tree. */
export function buildTaxonomyIndex(categories: ServiceCategoryNode[] = []): TaxonomyIndex {
  const byNode: Map<string, ResolvedTaxonomy> = new Map();
  const byCategory: Map<string, ServiceCategoryNode> = new Map();
  const categoryOrder: Map<string, number> = new Map();

  categories.forEach((category, index) => {
    byCategory.set(category.id, category);
    categoryOrder.set(category.id, index);

    for (const sub of category.subcategories ?? []) {
      byNode.set(sub.id, {
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        subSubcategoryId: null,
        subSubcategoryName: null,
      });

      for (const subSub of sub.subcategories ?? []) {
        byNode.set(subSub.id, {
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          subSubcategoryId: subSub.id,
          subSubcategoryName: subSub.name,
        });
      }
    }
  });

  return { byNode, byCategory, categoryOrder };
}

/**
 * Resolves a service's `category_id`/`subcategory_id` to a display path via the index.
 * Falls back gracefully when the stored node was deactivated in the catalog.
 */
export function resolveServiceTaxonomy(
  service: Pick<VendorService, 'category_id' | 'subcategory_id'>,
  index: TaxonomyIndex,
): ResolvedTaxonomy {
  const node = service.subcategory_id ? index.byNode.get(service.subcategory_id) : undefined;
  if (node) return node;

  const category = service.category_id ? index.byCategory.get(service.category_id) : undefined;
  return {
    categoryId: service.category_id ?? null,
    categoryName: category?.name ?? null,
    subcategoryId: service.subcategory_id ?? null,
    subcategoryName: null,
    subSubcategoryId: null,
    subSubcategoryName: null,
  };
}

/** "Hair › Haircut › Spanish Haircut" style label, skipping any missing levels. */
export function formatTaxonomyLabel(resolved: ResolvedTaxonomy | undefined): string {
  if (!resolved) return '';
  return [resolved.categoryName, resolved.subcategoryName, resolved.subSubcategoryName]
    .filter(Boolean)
    .join(' › ');
}

/** Every name in the path, lowercased, for search matching. */
export function taxonomySearchText(taxonomy: ResolvedTaxonomy | undefined): string {
  if (!taxonomy) return '';
  return [taxonomy.categoryName, taxonomy.subcategoryName, taxonomy.subSubcategoryName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export interface TaxonomyEntry {
  service: VendorService;
  taxonomy: ResolvedTaxonomy;
}

export interface TaxonomySubgroup {
  subcategoryId: string;
  subcategoryName: string;
  services: TaxonomyEntry[];
}

export interface TaxonomyGroup {
  categoryId: string;
  categoryName: string;
  count: number;
  subgroups: TaxonomySubgroup[];
}

/**
 * Groups services into category sections, each holding subcategory sub-groups.
 * Categories keep their catalog display_order (unknown ones sort last). Within
 * a category, subcategories sort alphabetically with the "General" bucket
 * (services saved without a subcategory) last.
 */
export function groupServicesByTaxonomy(entries: TaxonomyEntry[], index: TaxonomyIndex): TaxonomyGroup[] {
  const categoryGroups = new Map<
    string,
    { categoryId: string; categoryName: string; count: number; subgroupMap: Map<string, TaxonomySubgroup> }
  >();

  for (const entry of entries) {
    const { taxonomy } = entry;
    const categoryId = taxonomy.categoryId ?? '__uncategorised__';
    if (!categoryGroups.has(categoryId)) {
      categoryGroups.set(categoryId, {
        categoryId,
        categoryName: taxonomy.categoryName ?? UNCATEGORISED_LABEL,
        count: 0,
        subgroupMap: new Map(),
      });
    }

    const group = categoryGroups.get(categoryId)!;
    group.count += 1;

    const subcategoryId = taxonomy.subcategoryId ?? '__none__';
    if (!group.subgroupMap.has(subcategoryId)) {
      group.subgroupMap.set(subcategoryId, {
        subcategoryId,
        subcategoryName: taxonomy.subcategoryName ?? NO_SUBCATEGORY_LABEL,
        services: [],
      });
    }
    group.subgroupMap.get(subcategoryId)!.services.push(entry);
  }

  const orderOf = (categoryId: string) => index.categoryOrder.get(categoryId) ?? Number.MAX_SAFE_INTEGER;

  return Array.from(categoryGroups.values())
    .map(({ subgroupMap, ...group }) => ({
      ...group,
      subgroups: Array.from(subgroupMap.values()).sort((a, b) => {
        if (a.subcategoryId === '__none__') return 1;
        if (b.subcategoryId === '__none__') return -1;
        return a.subcategoryName.localeCompare(b.subcategoryName);
      }),
    }))
    .sort((a, b) => {
      const diff = orderOf(a.categoryId) - orderOf(b.categoryId);
      return diff !== 0 ? diff : a.categoryName.localeCompare(b.categoryName);
    });
}
