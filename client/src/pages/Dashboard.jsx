import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "../components/Dashboard";
import CoursesList from "../components/CoursesList";
import Toast from "../components/Toast";
const be_url = "http://localhost:4000";

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    const username = localStorage.getItem("username");
    axios.get(`${be_url}/api/v1/loginfetch?username=${username}`).then(res => {
      setCourses(res.data.courses || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setToast({ show: true, message: "Failed to load courses", type: "error" });
    });
  }, []);

  function handleStartCheck() {
    const username = localStorage.getItem("username");
    axios.post(`${be_url}/api/v1/checkSub/start`, {
      username,
      selectedCourseIds: selectedIds
    }).then(() => {
      setToast({ show: true, message: "Assignment checking started!", type: "success" });
    }).catch(() => {
      setToast({ show: true, message: "Failed to start job.", type: "error" });
    });
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <CoursesList
        courses={courses}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        loading={loading}
      />
      <button
        className="mt-6 bg-primary text-background block py-3 px-8 rounded shadow-md disabled:opacity-50"
        disabled={!selectedIds.length}
        onClick={handleStartCheck}
      >
        Check Pending Assignments
      </button>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
