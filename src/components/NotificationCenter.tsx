import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { NotificationItem } from '../os/types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function NotificationCenter({
  notifications,
  onDismiss,
  onClearAll,
}: NotificationCenterProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const monthLabel = viewMonth.toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-label="Notification Center and Calendar"
      className="animate-flyout-up acrylic-panel fixed bottom-[64px] right-3 z-50 flex max-h-[calc(100vh-84px)] w-[364px] flex-col overflow-hidden rounded-2xl border border-slate-300/80 bg-white/94 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/94 dark:text-slate-100"
    >
      {/* Notifications Section */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <h3 className="font-display text-xs font-semibold text-slate-800 dark:text-slate-100">
          Notifications
        </h3>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No new notifications. System services nominal.
          </p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.source} · {item.timestamp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(item.id)}
                  aria-label={`Dismiss ${item.title}`}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.body}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Calendar Section */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs font-semibold text-slate-800 dark:text-slate-100">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              className="rounded-md p-1 text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              className="rounded-md p-1 text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs tabular-nums">
          {calendarCells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            return (
              <div
                key={day}
                className={`flex h-7 items-center justify-center rounded-md ${
                  isToday
                    ? 'bg-sky-600 font-semibold text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
