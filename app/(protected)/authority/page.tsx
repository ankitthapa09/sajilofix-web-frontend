export default function AuthorityDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <p className="text-gray-600">
        Authority dashboard scaffold is ready. Next we can hook this into real
        report APIs (assigned reports, pending, resolved) and add actions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Assigned</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">—</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">—</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Resolved</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">—</div>
        </div>
      </div>
    </div>
  );
}
