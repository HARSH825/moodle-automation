export default function CoursesList({ courses, selectedIds, setSelectedIds, loading }) {
  function toggle(id) {
    setSelectedIds(selected =>
      selected.includes(id)
        ? selected.filter(cid => cid !== id)
        : [...selected, id]
    );
  }
  return (
    <div className="bg-card p-8 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-primary">Select Courses</h3>
      <ul>
        {courses.map(course => (
          <li key={course.id} className="flex items-center mb-3">
            <input
              type="checkbox"
              disabled={loading}
              checked={selectedIds.includes(course.id)}
              onChange={() => toggle(course.id)}
              className="mr-3 accent-primary"
            />
            <span>{course.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
