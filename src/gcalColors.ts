// Google Calendar's fixed event color palette. Event colorId is a string
// "1".."11" — these are the only values the API accepts (no custom hex).
// Reference: https://developers.google.com/workspace/calendar/api/v3/reference/colors

export type GCalColor =
  | 'lavender'
  | 'sage'
  | 'grape'
  | 'flamingo'
  | 'banana'
  | 'tangerine'
  | 'peacock'
  | 'graphite'
  | 'blueberry'
  | 'basil'
  | 'tomato';

export const GCAL_COLOR_IDS: Record<GCalColor, string> = {
  lavender: '1',
  sage: '2',
  grape: '3',
  flamingo: '4',
  banana: '5',
  tangerine: '6',
  peacock: '7',
  graphite: '8',
  blueberry: '9',
  basil: '10',
  tomato: '11',
};

// Approximate hex swatches, purely for a preview dot in our own UI —
// Google's actual rendering may vary slightly by theme.
export const GCAL_COLOR_HEX: Record<GCalColor, string> = {
  lavender: '#7986cb',
  sage: '#33b679',
  grape: '#8e24aa',
  flamingo: '#e67c73',
  banana: '#f6c026',
  tangerine: '#f5511d',
  peacock: '#039be5',
  graphite: '#616161',
  blueberry: '#3f51b5',
  basil: '#0b8043',
  tomato: '#d60000',
};
