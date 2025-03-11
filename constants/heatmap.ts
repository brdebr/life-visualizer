export const EVENT_TYPES = [
  'NO_DATA',
  'PERSONAL',
  'PAST',
] as const

export type EventTypeEnum = typeof EVENT_TYPES[number]

export type ColorsMapType = {
  [K in EventTypeEnum]: string
}

export const defaultHeatmapLightColorsMap: ColorsMapType = {
  NO_DATA: '#f3f3f3',
  PERSONAL: '#2563eb',
  PAST: '#dadada',
}

export const defaultHeatmapDarkColorsMap: ColorsMapType = {
  NO_DATA: '#d1d1d1',
  PERSONAL: '#2563eb',
  PAST: '#374151',
}

export const colors = {
  empty: {
    past: '#f3f3f3',
    future: '#e5e7eb',
  },
  event: {
    personal: '#2563eb',
  },
}
