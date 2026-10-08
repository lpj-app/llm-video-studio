export const FORMAT_IDS = ['9x16', '4x5', '1x1', '16x9'] as const;
export type FormatId = (typeof FORMAT_IDS)[number];

export const SET_IDS = ['gradient', 'grid', 'grid3d'] as const;
export type SetId = (typeof SET_IDS)[number];

export const ICON_IDS = ['heart', 'calendar', 'map', 'cards', 'sparkles', 'check', 'list', 'star', 'bell', 'chat', 'home', 'users', 'lock'] as const;
export type IconId = (typeof ICON_IDS)[number];
