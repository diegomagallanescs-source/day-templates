import { useMemo, useState } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { TEMPLATES } from './templates';
import { applyTemplate, clearDay } from './calendarApi';
import { CALENDAR_ID, CLIENT_ID, TIMEZONE } from './config';

function todayISO(): string {
  // Local calendar date as "YYYY-MM-DD", independent of UTC.
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type Status = { kind: 'idle' } | { kind: 'busy'; label: string } | { kind: 'ok'; message: string } | { kind: 'error'; message: string };

export default function App() {
  const { accessToken, ready, error: authError, signIn, signOut } = useGoogleAuth();
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const missingConfig = useMemo(() => {
    const missing: string[] = [];
    if (!CLIENT_ID) missing.push('VITE_GOOGLE_CLIENT_ID');
    if (!CALENDAR_ID) missing.push('VITE_GOOGLE_CALENDAR_ID');
    return missing;
  }, []);

  async function withStatus(label: string, fn: () => Promise<string>) {
    setStatus({ kind: 'busy', label });
    try {
      const message = await fn();
      setStatus({ kind: 'ok', message });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  async function handleClear() {
    if (!accessToken) return;
    if (!confirm(`Clear all app-created events on ${date}? This cannot be undone from here (though Calendar keeps a 30-day trash).`)) return;
    await withStatus('Clearing day…', async () => {
      const count = await clearDay(accessToken, date);
      return `Deleted ${count} event${count === 1 ? '' : 's'} on ${date}.`;
    });
  }

  async function handleApply(templateId: string) {
    if (!accessToken) return;
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    await withStatus(`Applying "${template.name}"…`, async () => {
      const count = await applyTemplate(accessToken, date, template);
      return `Added ${count} event${count === 1 ? '' : 's'} from "${template.name}" to ${date}.`;
    });
  }

  if (missingConfig.length > 0) {
    return (
      <main className="shell">
        <h1>Day Templates</h1>
        <p className="error">
          Missing config: <code>{missingConfig.join(', ')}</code>. Copy <code>.env.example</code> to <code>.env</code> and fill
          it in, then restart the dev server.
        </p>
      </main>
    );
  }

  return (
    <main className="shell">
      <header>
        <h1>Day Templates</h1>
        <p className="subtitle">Stamp a template onto a day, or clear what this app created.</p>
      </header>

      {!accessToken ? (
        <section className="signin">
          <button className="primary" disabled={!ready} onClick={() => signIn('')}>
            {ready ? 'Connect Google Calendar' : 'Loading…'}
          </button>
          {authError && <p className="error">{authError}</p>}
        </section>
      ) : (
        <>
          <section className="controls">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="ghost" onClick={signOut}>
              Disconnect
            </button>
          </section>

          <section className="templates">
            {TEMPLATES.map((t) => (
              <div className="template-card" key={t.id}>
                <div className="template-header">
                  <span className="emoji">{t.emoji}</span>
                  <h2>{t.name}</h2>
                </div>
                <ul className="blocks">
                  {t.blocks.map((b) => (
                    <li key={b.title}>
                      <span className="time">
                        {b.start}–{b.end}
                      </span>
                      <span>{b.title}</span>
                    </li>
                  ))}
                </ul>
                <button className="primary" onClick={() => handleApply(t.id)} disabled={status.kind === 'busy'}>
                  Apply to {date}
                </button>
              </div>
            ))}
          </section>

          <section className="danger-zone">
            <button className="danger" onClick={handleClear} disabled={status.kind === 'busy'}>
              Clear app-created events on {date}
            </button>
            <p className="hint">Only deletes events this app tagged when it created them. Everything else on your calendar is untouched.</p>
          </section>

          {status.kind !== 'idle' && (
            <p className={status.kind === 'error' ? 'error' : status.kind === 'busy' ? 'status busy' : 'status'}>
              {status.kind === 'busy' ? status.label : status.message}
            </p>
          )}

          <footer>
            <p className="hint">
              Calendar: <code>{CALENDAR_ID}</code> · Timezone: <code>{TIMEZONE}</code>
            </p>
          </footer>
        </>
      )}
    </main>
  );
}
