import { useMemo, useState } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { TEMPLATES } from './templates';
import { MEALS, type Meal } from './meals';
import { applyTemplate, clearAllEventsOnDay, clearDay, previewDay } from './calendarApi';
import { GCAL_COLOR_HEX } from './gcalColors';
import { CALENDAR_ID, CLIENT_ID, TIMEZONE } from './config';

type Mode = 'calendar' | 'meals';

function randomMeal(exclude?: string): Meal {
  const pool = MEALS.length > 1 ? MEALS.filter((m) => m.id !== exclude) : MEALS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function todayISO(): string {
  // Local calendar date as "YYYY-MM-DD", independent of UTC.
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type Status = { kind: 'idle' } | { kind: 'busy'; label: string } | { kind: 'ok'; message: string } | { kind: 'error'; message: string };

function StatusBanner({ status }: { status: Status }) {
  if (status.kind === 'idle') return null;
  const icon = status.kind === 'ok' ? '✓' : status.kind === 'error' ? '⚠' : '…';
  return (
    <div className={`status-banner ${status.kind}`}>
      <span>{icon}</span>
      <span>{status.kind === 'busy' ? status.label : status.message}</span>
    </div>
  );
}

export default function App() {
  const { accessToken, ready, error: authError, signIn, signOut } = useGoogleAuth();
  const [mode, setMode] = useState<Mode>('calendar');
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [meal, setMeal] = useState<Meal | null>(null);

  function handleGenerateMeal() {
    setMeal((current) => randomMeal(current?.id));
  }

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

  async function handleClearAll() {
    if (!accessToken) return;
    setStatus({ kind: 'busy', label: 'Checking what’s on this day…' });
    let preview: { total: number; appCreated: number };
    try {
      preview = await previewDay(accessToken, date);
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
      return;
    }
    if (preview.total === 0) {
      setStatus({ kind: 'ok', message: `No events found on ${date} — nothing to delete.` });
      return;
    }
    const outside = preview.total - preview.appCreated;
    const warning =
      outside > 0
        ? `Delete ALL ${preview.total} event(s) on ${date}? That includes ${outside} event(s) this app did NOT create — meetings, appointments, anything on your calendar that day. This cannot be undone from here (Calendar keeps a 30-day trash).`
        : `Delete ${preview.total} event(s) on ${date}? This cannot be undone from here (Calendar keeps a 30-day trash).`;
    setStatus({ kind: 'idle' });
    if (!confirm(warning)) return;
    await withStatus('Deleting everything on this day…', async () => {
      const count = await clearAllEventsOnDay(accessToken, date);
      return `Deleted ${count} event${count === 1 ? '' : 's'} on ${date} — all events, not just ones this app created.`;
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
      <div className="app">
        <main className="content">
          <div className="panel-header">
            <h1>Day Templates</h1>
          </div>
          <p className="error">
            Missing config: <code>{missingConfig.join(', ')}</code>. Copy <code>.env.example</code> to <code>.env</code> and fill
            it in, then restart the dev server.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">🗓️</span>
          <span>Day Templates</span>
        </div>
        <div className="mode-toggle" role="tablist">
          <button role="tab" aria-selected={mode === 'calendar'} className={mode === 'calendar' ? 'active' : ''} onClick={() => setMode('calendar')}>
            📅 Calendar
          </button>
          <button role="tab" aria-selected={mode === 'meals'} className={mode === 'meals' ? 'active' : ''} onClick={() => setMode('meals')}>
            🍽️ Meals
          </button>
        </div>
      </nav>

      <main className="content">
        {mode === 'calendar' ? (
          <>
            <div className="panel-header">
              <h1>Calendar</h1>
              <p>Stamp a template onto a day, or clear what this app created.</p>
            </div>

            {!accessToken ? (
              <div className="connect-card">
                <div className="icon">🔗</div>
                <h2>Connect your calendar</h2>
                <p>One-time approval — after that, sign-in is silent.</p>
                <button className="primary block" disabled={!ready} onClick={() => signIn('')}>
                  {ready ? 'Connect Google Calendar' : 'Loading…'}
                </button>
                {authError && <p className="error connect-error">{authError}</p>}
              </div>
            ) : (
              <>
                <div className="controls">
                  <label htmlFor="date">Date</label>
                  <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <button className="ghost spacer" onClick={() => setDate(todayISO())}>
                    Today
                  </button>
                  <button className="ghost" onClick={signOut}>
                    Disconnect
                  </button>
                </div>

                <div className="templates">
                  {TEMPLATES.map((t) => (
                    <div className="template-card" key={t.id}>
                      <div className="template-header">
                        <span className="emoji">{t.emoji}</span>
                        <h2>{t.name}</h2>
                      </div>
                      <ul className="blocks">
                        {t.blocks.map((b) => (
                          <li key={b.title}>
                            {b.color && <span className="color-dot" style={{ backgroundColor: GCAL_COLOR_HEX[b.color] }} />}
                            <span className="time">
                              {b.start}–{b.end}
                            </span>
                            <span>{b.title}</span>
                          </li>
                        ))}
                      </ul>
                      <button className="primary block" onClick={() => handleApply(t.id)} disabled={status.kind === 'busy'}>
                        Apply to {date}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="danger-zone">
                  <button className="danger" onClick={handleClear} disabled={status.kind === 'busy'}>
                    Clear app-created events on {date}
                  </button>
                  <p className="hint">Only deletes events this app tagged when it created them. Everything else on your calendar is untouched.</p>
                </div>

                <div className="danger-zone extreme">
                  <button className="danger-fill" onClick={handleClearAll} disabled={status.kind === 'busy'}>
                    ⚠ Delete ALL events on {date}
                  </button>
                  <p className="hint">
                    Deletes everything on this day — meetings, appointments, anything — not just what this app created. Shows you a count
                    and asks to confirm before deleting.
                  </p>
                </div>

                <StatusBanner status={status} />

                <footer>
                  <div className="badge-row">
                    <code>{CALENDAR_ID}</code>
                    <code>{TIMEZONE}</code>
                  </div>
                </footer>
              </>
            )}
          </>
        ) : (
          <>
            <div className="panel-header">
              <h1>What should I cook?</h1>
              <p>GERD-friendly ideas you can batch-cook for lunch and dinner.</p>
            </div>

            <div className="meal-generator">
              {meal && (
                <div className="meal-card">
                  <div className="meal-title">
                    <span className="emoji">{meal.emoji}</span>
                    <h3>{meal.name}</h3>
                  </div>
                  <p>{meal.description}</p>
                </div>
              )}
              <button className="primary" onClick={handleGenerateMeal}>
                {meal ? '🔁 Generate another' : '🎲 Surprise me'}
              </button>

              <div className="meal-chips">
                {MEALS.map((m) => (
                  <button key={m.id} className={`meal-chip ${meal?.id === m.id ? 'active' : ''}`} onClick={() => setMeal(m)}>
                    {m.emoji} {m.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
