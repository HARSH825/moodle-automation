export default function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">What Users Say</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center text-subtext">
            "So easy to use and super fast!"
            <div className="text-primary mt-2 font-semibold">— Student A</div>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg text-center text-subtext">
            "I’ve never submitted assignments this quickly before."
            <div className="text-primary mt-2 font-semibold">— Student B</div>
          </div>
        </div>
      </div>
    </section>
  )
}
