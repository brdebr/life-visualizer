// Description: Constants for the heatmap component.
export const MAGIC_VALUES = {
  // CELL SPACINGS
  spacings: {
    cellSize: 5,
    cellMargin: 1,
    spaceLeft: 23,
    spaceTop: 6,
    space: 1,
  },
  // LEGEND
  monthsLabels: {
    font: '8px sans-serif',
    textAlign: 'left',
    color: {
      currentMonth: '#4a7ab1',
      default: '#000',
    },
  },
  weekdaysLabels: {
    font: '8px sans-serif',
    letterSpacing: '0.5px',
    textAlign: 'right',
    color: '#000',
    spaceTop: 15,
  },
  // CELL COLORS
  cellColors: {
    highlight: '#ff4242',
    today: '#0ea5e9',
    hover: '#000',
    pastEmpty: '#dadada',
    futureEmpty: '#e5e7eb',
  },
} as const
