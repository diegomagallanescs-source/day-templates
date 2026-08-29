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
    id: 'sample-weekday',
    name: 'Sample Weekday',
    emoji: '💼',
    blocks: [
      { title: 'Wake Up / Coffee / Review Calendar', start: '06:00', end: '07:00' },
      { title: 'Work', start: '07:00', end: '08:30' },
      { title: 'Breakfast', start: '08:30', end: '09:15' },
      { title: 'Work', start: '09:30', end: '12:00' },
      { title: 'Lunch', start: '12:00', end: '13:00' },
      { title: 'Work', start: '13:00', end: '17:00' },
      { title: 'Gym', start: '17:00', end: '18:00' },
      { title: 'Dinner', start: '18:00', end: '19:00' },
      { title: 'Wind Down & Relax', start: '19:00', end: '21:00' },
    ],
  },
  {
    id: 'sample-weekend',
    name: 'Sample Weekend',
    emoji: '🎮',
    blocks: [
      { title: 'Wake Up / Coffee / Review Calendar', start: '06:00', end: '07:00' },
      { title: 'Work', start: '07:00', end: '08:30' },
      { title: 'Breakfast', start: '08:30', end: '09:15' },
      { title: 'Work', start: '09:30', end: '11:00' },
      { title: 'Read & Write Learnings', start: '11:00', end: '11:30' },
      { title: 'Make Lunch & Dinner', start: '11:45', end: '12:30' },
      { title: 'Doom Scroll & Clash', start: '12:30', end: '13:30' },
      { title: 'Work', start: '13:45', end: '15:45' },
      { title: 'Gym', start: '16:00', end: '17:00' },
      { title: 'Shower & Dinner', start: '17:00', end: '18:00' },
      { title: 'Xbox Time', start: '18:00', end: '19:00' },
      { title: 'Wind Down & Relax', start: '19:00', end: '21:00' },
    ],
  },
];
