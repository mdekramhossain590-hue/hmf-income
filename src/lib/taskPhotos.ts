// High-resolution thematic cover photos for task categories
export const DEFAULT_CATEGORY_PHOTOS: Record<string, string> = {
  YouTube: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
  Facebook: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  Telegram: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80',
  Instagram: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop&q=80',
  Gmail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80',
  Review: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'Sell Accounts': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  Microjob: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
  Typing: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
  'Watch Ads': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
  Other: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
};

export function getDefaultCategoryPhoto(category?: string): string {
  if (!category) return DEFAULT_CATEGORY_PHOTOS.Other;
  const c = category.toLowerCase().trim();
  if (c.includes('youtube')) return DEFAULT_CATEGORY_PHOTOS.YouTube;
  if (c.includes('facebook')) return DEFAULT_CATEGORY_PHOTOS.Facebook;
  if (c.includes('telegram')) return DEFAULT_CATEGORY_PHOTOS.Telegram;
  if (c.includes('instagram')) return DEFAULT_CATEGORY_PHOTOS.Instagram;
  if (c.includes('gmail') || c.includes('mail')) return DEFAULT_CATEGORY_PHOTOS.Gmail;
  if (c.includes('review') || c.includes('rating') || c.includes('star')) return DEFAULT_CATEGORY_PHOTOS.Review;
  if (c.includes('sell') || c.includes('account')) return DEFAULT_CATEGORY_PHOTOS['Sell Accounts'];
  if (c.includes('typing') || c.includes('writing') || c.includes('data entry')) return DEFAULT_CATEGORY_PHOTOS.Typing;
  if (c.includes('ad') || c.includes('watch') || c.includes('video')) return DEFAULT_CATEGORY_PHOTOS['Watch Ads'];
  if (c.includes('micro') || c.includes('task') || c.includes('job')) return DEFAULT_CATEGORY_PHOTOS.Microjob;
  return DEFAULT_CATEGORY_PHOTOS.Other;
}
