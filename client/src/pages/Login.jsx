import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import axios from "axios";

const backend_url = "http://localhost:4000";
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(username, password) {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${backend_url}/api/v1/loginfetch`, { username, password });
      if (res.data.success) {
        localStorage.setItem("username", username);
        navigate("/dashboard");
      } else {
        setError(res.data.error);
      }
    } catch {
      setError("Login failed.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
