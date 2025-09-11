import DataTable from '@/components/admin/DataTable';

const rows = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin', status: 'active' as const },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'editor', status: 'active' as const },
  { id: '3', name: 'Cathy', email: 'cathy@example.com', role: 'viewer', status: 'suspended' as const },
];

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users</h2>
      <DataTable rows={rows} />
    </div>
  );
}
