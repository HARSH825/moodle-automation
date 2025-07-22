import { useState } from "react";

export default function AuthForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(username, password);
  }

  return (
    <form className="bg-card p-8 rounded-xl w-96 shadow-xl" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign In</h2>
      {error && <div className="mb-4 text-danger">{error}</div>}
      <input
        className="w-full mb-4 p-3 rounded bg-background border border-neutral-700 focus:outline-none"
        type="text"
        placeholder="Moodle Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        className="w-full mb-4 p-3 rounded bg-background border border-neutral-700 focus:outline-none"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="w-full bg-primary text-background font-semibold py-3 rounded hover:bg-secondary transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Loading..." : "Log In"}
      </button>
    </form>
  );
}
