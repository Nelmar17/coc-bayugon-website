import LegalLayout from "@/components/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Guidelines for using our website and member services."
    >
      <Section title="Website Use">
        This website is intended for church information, sermons,
        Bible studies, and member services.
      </Section>

      <Section title="Member Accounts">
        You are responsible for maintaining account security and
        providing accurate information.
      </Section>

      <Section title="Content Ownership">
        All sermons, text, and media belong to the Church of Christ
        unless otherwise stated.
      </Section>

      <Section title="Limitation of Liability">
        We do not guarantee uninterrupted access to the website.
      </Section>

      <Section title="Governing Law">
        These terms are governed by the laws of the Republic of the Philippines.
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
