import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { PageHeader, Card, Button, EmptyState, cn } from "@/design-system";

export function NotificationsPage({ api }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => { api.getNotifications().then(setNotifs).catch(() => {}); }, []);
  const unread = notifs.filter((n) => !n.read).length;

  const markAll = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markOne = (id) => setNotifs((p) => p.map((x) => (x.id === id ? { ...x, read: true } : x)));

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} non lue(s)` : "Vous êtes à jour"}
        actions={unread > 0 && <Button variant="outline" size="sm" onClick={markAll}>Tout marquer comme lu</Button>}
      />

      <Card>
        {notifs.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune notification" message="Vos notifications apparaîtront ici." />
        ) : (
          notifs.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markOne(n.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-line-soft px-5 py-3.5 text-left transition last:border-0 hover:bg-surface-2",
                !n.read && "bg-surface-2"
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-strong)]">
                {n.icon || <Bell size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[13px] text-ink", n.read ? "font-medium" : "font-bold")}>{n.title}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-ink-muted">{n.body}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[10.5px] text-ink-subtle">{n.date}</span>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
              </div>
            </button>
          ))
        )}
      </Card>
    </>
  );
}
