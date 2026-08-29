import { APP_TAG, CALENDAR_ID, TIMEZONE } from './config';
import type { Template } from './templates';

const BASE = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;

interface GCalEvent {
  id: string;
  summary?: string;
}

async function request(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API ${res.status}: ${body}`);
  }
  // DELETE returns an empty body.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// timeMin/timeMax must be RFC3339 with an explicit UTC offset — Google does
// not accept a naive local time plus a separate timezone for these two
// params (unlike event start/end, which do accept that). So for a given
// "YYYY-MM-DD" + IANA zone, work out that date's actual offset (DST-aware)
// using the browser's own Intl data, no date library required.
function offsetFor(date: string, timeZone: string): string {
  const probe = new Date(`${date}T12:00:00Z`); // midday avoids any DST-edge ambiguity
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(probe);
  const raw = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  // raw looks like "GMT-05:00" or "GMT+00:00"
  const match = raw.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : '+00:00';
}

function dayBounds(date: string, timeZone: string) {
  const offset = offsetFor(date, timeZone);
  return {
    timeMin: `${date}T00:00:00${offset}`,
    timeMax: `${date}T23:59:59${offset}`,
  };
}

/** Delete every event on `date` that this app created (tagged with APP_TAG). */
export async function clearDay(token: string, date: string): Promise<number> {
  const { timeMin, timeMax } = dayBounds(date, TIMEZONE);
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    privateExtendedProperty: `app=${APP_TAG}`,
  });
  const list = await request(token, `?${params.toString()}`);
  const items: GCalEvent[] = list.items ?? [];
  await Promise.all(items.map((e) => request(token, `/${e.id}`, { method: 'DELETE' })));
  return items.length;
}

/** Insert every block of `template` onto `date`. */
export async function applyTemplate(token: string, date: string, template: Template): Promise<number> {
  await Promise.all(
    template.blocks.map((block) =>
      request(token, '', {
        method: 'POST',
        body: JSON.stringify({
          summary: block.title,
          description: block.description,
          start: { dateTime: `${date}T${block.start}:00`, timeZone: TIMEZONE },
          end: { dateTime: `${date}T${block.end}:00`, timeZone: TIMEZONE },
          extendedProperties: {
            private: { app: APP_TAG, templateId: template.id },
          },
        }),
      }),
    ),
  );
  return template.blocks.length;
}
