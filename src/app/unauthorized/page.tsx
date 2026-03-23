export const metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
      <p className="text-gray-600">
        You must be a superadmin or matrix admin to access this area.
      </p>
    </main>
  );
}