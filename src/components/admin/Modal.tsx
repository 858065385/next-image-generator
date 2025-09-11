'use client';
export default function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded p-4 w-[400px]">
        <div className="flex justify-between items-center">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
