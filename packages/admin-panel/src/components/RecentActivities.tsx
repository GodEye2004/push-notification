'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Activity = {
  id: string;
  title: string;
  body?: string;
  deviceName?: string | null;
  timestamp: string; // ISO
};

export default function RecentActivities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/activities', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 12000);
    return () => clearInterval(iv);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  }

  function handleLogout() {
    // Example: clear auth token and redirect to /login
    try {
      localStorage.removeItem('auth_token');
    } catch (_) {}
    router.push('/login');
  }

  return (
    <section className="panel">
      <div className="header">
        <h2>Recent Activities</h2>
        <div>
          <button className="btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {loading && <div className="hint">Loading…</div>}
      {!loading && items.length === 0 && <div className="hint">No activities yet</div>}

      <ul className="list">
        {items.map((it) => (
          <li key={it.id} className="item">
            <div className="left">
              <div className="title">{it.title}</div>
              <div className="meta">{it.deviceName ?? 'Unknown device'} • {new Date(it.timestamp).toLocaleString()}</div>
              {it.body ? <div className="body">{it.body}</div> : null}
            </div>
            <div className="right">
              <button className="btn delete" onClick={() => handleDelete(it.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .panel { background:#fff; padding:16px; border-radius:8px; box-shadow:0 4px 14px rgba(12,12,15,0.06); margin-top:16px; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        h2 { margin:0; font-size:18px; }
        .hint { color:#666; padding:8px 0; }
        .list { list-style:none; padding:0; margin:0; }
        .item { display:flex; align-items:flex-start; justify-content:space-between; padding:12px; border-bottom:1px solid #f7f7f7;
               transition: background .12s ease, transform .12s ease; }
        .item:hover { background:#fafafa; transform: translateY(-3px); }
        .title { font-weight:600; }
        .meta { font-size:12px; color:#666; margin-top:6px; }
        .body { margin-top:8px; color:#333; }
        .btn { border:0; background:#e6e6e6; padding:6px 10px; border-radius:6px; cursor:pointer; }
        .delete { background:#ffecec; color:#b23a3a; }
        .logout { background:#eef6ff; color:#1666c1; margin-left:8px; }
      `}</style>
    </section>
  );
}