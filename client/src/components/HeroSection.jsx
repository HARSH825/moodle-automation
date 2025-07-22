export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-28 bg-gradient-to-br from-background via-card to-background">
      <h1 className="text-5xl font-bold mb-4 text-primary">Effortless AI Assignment Automation</h1>
      <p className="text-lg text-subtext mb-8 max-w-xl">
        Let our platform handle assignment & document generation for you in seconds. Save time. Work smart. Elevate results.
      </p>
      <a href="/login" className="rounded-lg px-6 py-3 font-semibold bg-primary text-background transition hover:bg-secondary">
        Get Started
      </a>
    </section>
  );
}
