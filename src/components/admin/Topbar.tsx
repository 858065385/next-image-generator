'use client';
export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 bg-white border-b h-14 flex items-center px-3 justify-between">
      <button onClick={onMenuClick} className="md:hidden">☰</button>
      <div className="flex-1 text-center font-bold">Admin Panel</div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded">Create</button>
        <img src="https://i.pravatar.cc/40" alt="avatar" className="w-8 h-8 rounded-full" />
      </div>
    </header>
  );
}
