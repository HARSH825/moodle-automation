const features = [
  {
    title: "1-Click Assignment Generation",
    desc: "Generate fully formatted assignment documents in seconds with AI.",
  },
  {
    title: "Secure Moodle Login",
    desc: "Authenticate safely with your Moodle credentials.",
  },
  {
    title: "Pending Assignment Checker",
    desc: "Detect and view all your unsubmitted assignments instantly.",
  },
  {
    title: "Fast Downloads",
    desc: "Download professionally styled, ready-to-submit files.",
  },
  {
    title: "Data Privacy",
    desc: "Your data is protected with best-in-class security.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-xl p-8 shadow-lg border border-neutral-800">
              <h3 className="text-xl font-semibold mb-4 text-primary">{f.title}</h3>
              <p className="text-subtext">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
