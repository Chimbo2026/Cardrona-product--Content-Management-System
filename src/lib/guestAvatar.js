/**
 * Deterministic placeholder face photos for demo guest cards.
 * The URL is stable per guest, so the same face follows the guest everywhere
 * (list, check-in panel) and can simply be replaced by storing a real
 * photo in `avatar_url`.
 */
export function guestAvatarUrl(guest) {
  if (guest?.avatar_url) return guest.avatar_url;
  const seed = guest?.email || guest?.id || guest?.full_name || 'guest';
  return `https://i.pravatar.cc/240?u=${encodeURIComponent(String(seed))}`;
}

export function guestInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}