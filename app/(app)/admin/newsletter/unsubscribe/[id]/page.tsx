import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function UnsubscribePage({ params }: any) {
  const id = Number(params.id);

  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { id },
  });

  if (!sub) return notFound();

  await prisma.newsletterSubscriber.delete({ where: { id } });

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">You have been unsubscribed</h1>
      <p className="text-gray-600">
        {sub.email} will no longer receive our newsletters.
      </p>
    </div>
  );
}
