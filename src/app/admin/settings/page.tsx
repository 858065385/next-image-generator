export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>
      <section className="rounded-lg border bg-white p-4">
        <h3 className="font-medium">General</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-gray-600">Site Name</div>
            <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Your app" />
          </label>
        </div>
      </section>
    </div>
  );
}
