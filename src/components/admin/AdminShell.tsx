'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex-1 min-h-screen">
        <Topbar onMenuClick={() => setCollapsed(v => !v)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
