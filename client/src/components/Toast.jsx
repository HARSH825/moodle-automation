export default function Toast({ show, message, type = "info", onClose }) {
  if (!show) return null;
  const color = type === "error" ? "bg-danger" : type === "success" ? "bg-success" : "bg-secondary";
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-background ${color}`}>
      {message}
      <button className="ml-4 text-sm underline" onClick={onClose}>Dismiss</button>
    </div>
  );
}
