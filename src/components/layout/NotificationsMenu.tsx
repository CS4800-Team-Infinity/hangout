"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

type NotificationItem = {
  _id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // close when clicking outside
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    // Debug: indicate the notifications menu mounted
    try {
      console.log('[NotificationsMenu] mounted', { tokenPresent: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false });
    } catch (e) {
      // ignore if localStorage not available in the environment
    }
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Refresh notifications every 30 seconds if the component is mounted
  useEffect(() => {
    fetchNotifications(); // initial fetch
    refreshInterval.current = setInterval(fetchNotifications, 30000);
    // Listen for manual refresh events so other parts of the app can
    // request an immediate notifications refresh (e.g. after RSVP join)
    const onRefresh = () => fetchNotifications();
    if (typeof window !== 'undefined') {
      window.addEventListener('notifications:refresh', onRefresh as EventListener);
    }
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('notifications:refresh', onRefresh as EventListener);
      }
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Force a fresh response to avoid 304 (Not Modified) cached responses
      // which can prevent the client from seeing newly-created notifications.
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Add a cache-busting query param to avoid any conditional GET/304 responses
      const url = `/api/notifications?_=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers,
      });

      // Log response status and key headers to help debug 304/conditional GET behavior
      try {
        console.log('[NotificationsMenu] fetch status', res.status, res.statusText, {
          etag: res.headers.get('etag'),
          'last-modified': res.headers.get('last-modified'),
          age: res.headers.get('age'),
        });
      } catch (e) {
        // ignore
      }

      if (res.status === 200) {
        const data = await res.json();
        try {
          console.log('[NotificationsMenu] fetch /api/notifications response', data);
        } catch (e) {}
        setNotifications(data.notifications || []);
      } else {
        // For other statuses, attempt to parse and log body to aid debugging
        console.warn('[NotificationsMenu] unexpected response', res.status, res.statusText);
        try {
          const fallback = await res.json();
          console.warn('[NotificationsMenu] response body', fallback);
          if (fallback && Array.isArray(fallback.notifications)) {
            setNotifications(fallback.notifications || []);
          }
        } catch (err) {
          // if parsing failed, do nothing — keep existing notifications
        }
      }
    } catch (e) {
      // ignore for now
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);

    // When opening, mark unread notifications as read
    if (willOpen) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      if (unreadIds.length > 0) {
        // optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        // persist to server
        (async () => {
          try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
              },
              body: JSON.stringify({ ids: unreadIds }),
            });
                // Refresh to ensure server state is reflected locally
                fetchNotifications();
          } catch (e) {
            // if it fails, revert optimistic read state by re-fetching
            console.warn('Failed to mark notifications read:', e);
            fetchNotifications();
          }
        })();
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Gradient border wrapper to match site theme */}
      <div className="p-[2px] rounded-full bg-gradient-to-r from-[#5D5FEF] via-[#8A5AF1] to-[#EF5DA8] inline-flex mr-2">
        <Button
          variant="ghost"
          size="sm"
          className="!p-2 bg-white rounded-full shadow-sm"
          onClick={toggle}
        >
          {/* Icon colored to match gradient */}
          <Bell size={18} className="text-[#5D5FEF]" />
        </Button>
      </div>

      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 translate-x-2 -translate-y-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-gradient-to-r from-[#5D5FEF] via-[#8A5AF1] to-[#EF5DA8] rounded-full">
          {unreadCount}
        </span>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 pb-2">
              <strong>Notifications</strong>
              <button
                className="text-sm text-zinc-500"
                onClick={() => {
                  // refresh
                  fetchNotifications();
                }}
              >
                Refresh
              </button>
            </div>

            <div className="max-h-64 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-zinc-500">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="px-3 py-2 border-b last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
              <div className="text-sm font-semibold text-zinc-900">{n.title}</div>
              {n.body && <div className="text-sm text-zinc-700">{n.body}</div>}
                      </div>
                      <div className="text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
