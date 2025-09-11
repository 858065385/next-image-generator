'use client';
import { useState } from 'react';

type Row = { id: string; name: string; email: string; role: string; status: 'active'|'suspended' };

export default function DataTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');
  const filtered = rows.filter(r => [r.name, r.email, r.role].join(' ').toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="rounded-lg border bg-white">
      <div className="p-3 border-b flex justify-between">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter users…" className="border rounded px-2 py-1" />
        <button className="px-2 py-1 border rounded bg-gray-900 text-white">Add</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {filtered.map(r=>(
            <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.role}</td><td>{r.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
