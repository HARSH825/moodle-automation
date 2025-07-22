import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Generate from "./pages/Generate";
import Status from "./pages/Status";
import Downloads from "./pages/Downloads";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/status" element={<Status />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
      </Router>
    </div>
  );
}
