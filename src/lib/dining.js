// Sample photography used when a venue has no uploaded photo yet.
const TYPE_PHOTOS = {
  Restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=70',
  Cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=70',
  Bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=70',
};

export function venuePhoto(venue) {
  if (venue?.image_url) return venue.image_url;
  return TYPE_PHOTOS[venue?.venue_type] || TYPE_PHOTOS.Restaurant;
}