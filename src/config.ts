// Every event this app creates gets tagged with this extended property.
// The "clear day" action only ever deletes events carrying this tag, so it
// can never touch anything else on the calendar.
export const APP_TAG = 'daytemplates';

export const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID as string;
export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// IANA timezone used when writing event start/end times. Google resolves
// DST from this, so you never do offset math by hand.
// Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
export const TIMEZONE =
  (import.meta.env.VITE_TIMEZONE as string) || 'America/Chicago';

export const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
