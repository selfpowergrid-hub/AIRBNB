// Single source of truth for what Port Hill charges.
//
// The rooms table carries one price_per_night column, which cannot express the
// villa's per-bedroom ladder or the studio's day-room rate. Rates therefore live
// here, and the database rows are used only for identity and availability.
// Change a number here and it updates the booking flow everywhere at once.

export type RoomType = 'studio' | 'villa';
export type StayType = 'overnight' | 'day';

export const STUDIO = {
    label: 'Efficiency Studio',
    blurb: 'Self-contained studio house',
    overnightRate: 1500,
    dayRoomRate: 1500,
    /** Seven physical studio houses on the property. */
    totalUnits: 7,
    maxGuestsPerUnit: 2,
};

export const VILLA = {
    label: 'Executive Airbnb',
    blurb: '5-bedroom residential villa',
    /** Index 0 is one bedroom, index 4 is the whole villa. */
    bedroomRates: [2500, 3500, 4500, 6000, 7500],
    totalBedrooms: 5,
    maxGuestsPerBedroom: 2,
};

/** Shown if the addons table cannot be reached, so extras never silently vanish. */
export const FALLBACK_ADDONS = [
    { id: 'fallback-space', name: 'Bonfire Space', price: 1500, category: 'bonfire', sort_order: 1 },
    { id: 'fallback-firewood', name: 'Firewood', price: 500, category: 'bonfire', sort_order: 2 },
    { id: 'fallback-charcoal', name: 'Charcoal', price: 500, category: 'bonfire', sort_order: 3 },
    { id: 'fallback-grill', name: 'Grill', price: 500, category: 'bonfire', sort_order: 4 },
];

export function villaRate(bedrooms: number): number {
    const i = Math.min(Math.max(bedrooms, 1), VILLA.totalBedrooms) - 1;
    return VILLA.bedroomRates[i];
}

export function studioRate(stayType: StayType): number {
    return stayType === 'day' ? STUDIO.dayRoomRate : STUDIO.overnightRate;
}

/**
 * What the accommodation costs, before extras.
 * A day room is a flat charge for the day, so nights are not applied.
 */
export function accommodationTotal(opts: {
    roomType: RoomType;
    stayType: StayType;
    studioUnits: number;
    villaBedrooms: number;
    nights: number;
}): number {
    const { roomType, stayType, studioUnits, villaBedrooms, nights } = opts;

    if (roomType === 'studio') {
        const rate = studioRate(stayType);
        return stayType === 'day' ? rate * studioUnits : rate * studioUnits * Math.max(1, nights);
    }

    return villaRate(villaBedrooms) * Math.max(1, nights);
}

/** Highest number a guest can be quoted, used for the "from" labels. */
export const STUDIO_FROM = STUDIO.overnightRate;
export const VILLA_FROM = VILLA.bedroomRates[0];
