export default function AssignmentsList({ assignments, selectedIds, setSelectedIds, loading }) {
  function toggle(id) {
    setSelectedIds(selected =>
      selected.includes(id)
        ? selected.filter(aid => aid !== id)
        : [...selected, id]
    );
  }
  return (
    <div className="bg-card p-8 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-primary">Select Unsubmitted Assignments</h3>
      <ul>
        {assignments.map(assignment => (
          <li key={assignment.id} className="flex items-center mb-3">
            <input
              type="checkbox"
              disabled={loading}
              checked={selectedIds.includes(assignment.id)}
              onChange={() => toggle(assignment.id)}
              className="mr-3 accent-primary"
            />
            <span>{assignment.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
