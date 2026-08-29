// Day templates, baked into the code. To add a new one, append another
// object to TEMPLATES below and redeploy — no UI or database needed.
//
// Times are "HH:MM" in 24-hour local time, applied on whatever date you pick
// in the app. TIMEZONE controls how Google resolves DST — see config.ts.

export interface Block {
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  blocks: Block[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'deep-work',
    name: 'Deep Work Day',
    emoji: '🧠',
    blocks: [
      { title: 'Morning routine', start: '07:00', end: '08:00' },
      { title: 'Deep work — block 1', start: '08:00', end: '10:30' },
      { title: 'Break', start: '10:30', end: '10:45' },
      { title: 'Deep work — block 2', start: '10:45', end: '13:00' },
      { title: 'Lunch', start: '13:00', end: '14:00' },
      { title: 'Admin / email', start: '14:00', end: '15:00' },
      { title: 'Deep work — block 3', start: '15:00', end: '17:00' },
    ],
  },
  {
    id: 'light-day',
    name: 'Light / Recovery Day',
    emoji: '🌤️',
    blocks: [
      { title: 'Morning routine', start: '08:00', end: '09:00' },
      { title: 'Light tasks', start: '09:00', end: '11:00' },
      { title: 'Long break', start: '11:00', end: '13:00' },
      { title: 'Errands', start: '13:00', end: '15:00' },
    ],
  },
];
