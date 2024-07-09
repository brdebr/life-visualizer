export const EVENT_TYPES = [
  'NO_DATA',
  'PERSONAL',
  'HISTORICAL',
  'PAST',
] as const

export type EventTypeEnum = typeof EVENT_TYPES[number]

export type ColorsMapType = {
  [K in EventTypeEnum]: string
}

export const defaultHeatmapLightColorsMap: ColorsMapType = {
  NO_DATA: '#d1d1d1',
  PERSONAL: '#2563eb',
  HISTORICAL: '#2dd4bf',
  PAST: '#f3f3f3',
}

export const defaultHeatmapDarkColorsMap: ColorsMapType = {
  NO_DATA: '#d1d1d1',
  PERSONAL: '#2563eb',
  HISTORICAL: '#2dd4bf',
  PAST: '#374151',
}

export const colors = {
  empty: {
    past: '#f3f3f3',
    future: '#e5e7eb',
  },
  event: {
    historical: '#2dd4bf',
    personal: '#2563eb',
  },
}
