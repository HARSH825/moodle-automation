export default function Dashboard({ courses, onSelectCourse }) {
  return (
    <section className="p-10">
      <h2 className="text-2xl font-bold mb-8 text-primary">Your Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="bg-card rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg"
            onClick={() => onSelectCourse(course)}
          >
            <div className="text-xl font-semibold">{course.title}</div>
            <div className="text-subtext">{course.id}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
