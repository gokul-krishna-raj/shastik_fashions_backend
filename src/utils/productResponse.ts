import { Document } from 'mongoose';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const transformProduct = (productDoc: any) => {
  if (!productDoc) return productDoc;

  const product = productDoc.toObject ? productDoc.toObject() : { ...productDoc };

  // existing fields remain (e.g., name, description, price, originalPrice, images, etc.)
  const id = product._id ? product._id.toString() : product.id;

  // category id
  const category_id = product.category && product.category._id ? product.category._id.toString() : product.category;

  // images
  const images = product.images || [];
  const image_url = images.length > 0 ? images[0] : null;

  // colors handling: prefer an array if present, otherwise split comma-separated string
  let colors: string[] = [];
  if (Array.isArray(product.colors) && product.colors.length) {
    colors = product.colors;
  } else if (product.color) {
    colors = product.color.toString().split(',').map((c: string) => c.trim()).filter(Boolean);
  }

  // sizes
  const sizes = product.sizes || [];

  // color_images: use existing field if present, else map each color to image_url
  let color_images: Record<string, string> = {};
  if (product.color_images && typeof product.color_images === 'object') {
    color_images = product.color_images;
  } else if (product.colorImages && typeof product.colorImages === 'object') {
    color_images = product.colorImages;
  } else if (colors.length > 0 && image_url) {
    colors.forEach((c: string) => (color_images[c] = image_url));
  }

  const in_stock =
    typeof product.stock === 'number'
      ? product.stock > 0
      : typeof product.inStock === 'boolean'
      ? product.inStock
      : Boolean(product.in_stock);

  const featured = product.featured ?? product.isNewArrival ?? false;
  const bestseller = product.bestseller ?? product.isBestSeller ?? false;

  const rating = product.rating ?? 0;
  const review_count = product.review_count ?? product.reviewCount ?? 0;

  const created_at = product.createdAt ? new Date(product.createdAt).toISOString() : product.created_at;
  const updated_at = product.updatedAt ? new Date(product.updatedAt).toISOString() : product.updated_at;

  return {
    // Keep all original fields
    ...product,
    // Add new fields (snake_case) for compatibility
    id,
    slug: product.slug || slugify(product.name || ''),
    price: product.price,
    original_price: product.originalPrice ?? product.original_price,
    category_id,
    image_url,
    images,
    sizes,
    colors,
    in_stock,
    featured,
    rating,
    review_count,
    created_at,
    updated_at,
    bestseller,
    color_images,
  };
};

export default transformProduct;