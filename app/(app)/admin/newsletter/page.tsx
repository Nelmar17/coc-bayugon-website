import { prisma } from "@/lib/prisma";

export default async function NewsletterAdminPage() {
  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Newsletter Subscribers</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Joined</th>
            <th className="p-2 border">Unsubscribe</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s:any) => (
            <tr key={s.id} className="text-gray-800">
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border">{s.name || "-"}</td>
              <td className="p-2 border">{s.createdAt.toLocaleString()}</td>
              <td className="p-2 border">
                <a
                  href={`/newsletter/unsubscribe/${s.id}`}
                  className="text-red-600 underline"
                >
                  Unsubscribe
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
