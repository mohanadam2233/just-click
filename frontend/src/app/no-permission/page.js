export default function NoPermissionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-2xl font-bold mb-2">🚫 Access Denied</h1>
      <p className="text-gray-500">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
