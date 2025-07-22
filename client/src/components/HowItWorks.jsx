const steps = [
  'Log in securely',
  'Select your courses',
  'See pending assignments',
  'Generate documents',
  'Download your files'
];
export default function HowItWorks() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <ol className="flex flex-col md:flex-row justify-center items-center gap-6">
          {steps.map((step, idx) => (
            <li key={idx} className="bg-card rounded-full p-6 shadow-md text-lg font-medium flex-1">
              {idx + 1}. {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
