// Sample room photography used when a unit has no uploaded photo yet.
const TYPE_PHOTOS = {
  'Studio Apartment': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=70',
  'Two Bedroom Apartment': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70',
  'Three Bedroom Apartment': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=70',
  'Four Bedroom Apartment': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=70',
  'Three Bedroom Loft': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70',
};

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=70';

export function roomPhoto(unit) {
  if (unit?.image_url) return unit.image_url;
  return TYPE_PHOTOS[unit?.unit_type] || FALLBACK_PHOTO;
}