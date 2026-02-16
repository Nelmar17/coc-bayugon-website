import LegalLayout from "@/components/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy and trust are important to us."
    >
      <Section title="Information We Collect">
        We may collect personal information such as name, email,
        attendance records, and account details for members.
      </Section>

      <Section title="How We Use Information">
        Information is used to manage member accounts, communicate
        church updates, and improve our website services.
      </Section>

      <Section title="Data Protection">
        We implement reasonable safeguards to protect your data.
      </Section>

      <Section title="Third-Party Links">
        Our website may link to external sites such as Facebook or YouTube.
        We are not responsible for their privacy practices.
      </Section>

      <Section title="Contact">
        Church of Christ  
        Bayugon, Philippines  
        info@churchofchrist.org
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
