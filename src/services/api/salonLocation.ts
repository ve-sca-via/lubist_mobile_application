/**
 * Salon location display helpers.
 *
 * Salon cards used to show only "City, State", while the web app's card shows
 * the salon's full street address. These helpers keep both apps in sync: prefer
 * the salon's own `address`, and append city/state only when the stored address
 * doesn't already mention them (vendors often type the city into the address).
 */

export interface SalonLocationLike {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  distance_km?: number | null;
}

/** Full address for a salon: street address + city/state, de-duplicated. */
export function salonAddress(s: SalonLocationLike): string {
  const address = (s.address ?? '').trim().replace(/[,\s]+$/, '');
  const lower = address.toLowerCase();
  const extras = [s.city, s.state]
    .map((part) => (part ?? '').trim())
    .filter((part) => part && !lower.includes(part.toLowerCase()));

  return [address, ...extras].filter(Boolean).join(', ');
}

/** `450 m` under a kilometre, `1.2 km` above it — same as the web card. */
export function formatDistance(km?: number | null): string {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Card label: full address, with the distance appended when the listing
 * endpoint provides one (nearby/location searches).
 */
export function salonLocationLabel(
  s: SalonLocationLike,
  fallback = 'Location unavailable',
): string {
  const address = salonAddress(s);
  const distance = formatDistance(s.distance_km);

  if (!address) return distance || fallback;
  return distance ? `${address} • ${distance}` : address;
}
