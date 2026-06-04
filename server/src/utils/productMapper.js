/**
 * Maps DB product document to frontend-compatible shape (matches src/data/products.ts).
 */
export const toPublicProduct = (product, options = {}) => {
  const doc = product.toObject ? product.toObject({ virtuals: true }) : product;
  const categorySlug =
    doc.category?.slug || doc.categorySlug || doc.category || 'accessories';

  const primaryImage =
    doc.images?.find((img) => img.isPrimary)?.url ||
    doc.images?.[0]?.url ||
    doc.image ||
    '';

  const colors =
    doc.variants?.length > 0
      ? doc.variants
          .filter((v) => v.color?.name)
          .map((v) => ({
            name: v.color.name,
            hex: v.color.hex,
          }))
          .filter(
            (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i
          )
      : doc.colors || [];

  return {
    id: doc.slug,
    _id: doc._id?.toString(),
    name: doc.name,
    category: categorySlug,
    categoryRef: (doc.category?._id || doc.category)?.toString(),
    subcategoryRef: (doc.subcategory?._id || doc.subcategory)?.toString(),
    price: doc.price,
    originalPrice: doc.compareAtPrice ?? doc.originalPrice,
    rating: doc.ratingsAverage ?? doc.rating ?? 0,
    reviewCount: doc.ratingsCount ?? 0,
    image: primaryImage,
    images: (doc.images || []).map((img) => ({
      url: img.url,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
    })),
    badge: doc.badge,
    description: doc.description,
    colors,
    specs: doc.specs || [],
    featured: doc.featured,
    trending: doc.trending,
    inStock: doc.totalStock > 0,
    totalStock: doc.totalStock,
    variants: (doc.variants || []).map((v) => ({
      id: v._id?.toString(),
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock: v.stock,
      price: v.price ?? doc.price,
    })),
    relatedProducts: options.relatedProducts,
  };
};

export const toPublicProductList = (products) =>
  products.map((p) => toPublicProduct(p));
