import { useEffect, useState } from "react";
import axios from "axios";
import AssignmentsList from "../components/AssignmentsList";
import DocGeneration from "../components/DocGeneration";
import StatusModal from "../components/StatusModal";
import Toast from "../components/Toast";

const be_url = "http://localhost:4000";
const MAX_ASSIGNMENTS = 5;

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    // Fetch assignments from API; example static username
    const username = localStorage.getItem("username");
    axios.get(`${be_url}/api/v1/checkSub/assignments/${username}`).then(res => {
      setAssignments(
        Object.values(res.data.nonSubmittedAssignments)
          .flatMap(course => course.assignments || [])
      );
      setLoading(false);
    }).catch(() => {
      setToast({ show: true, message: "Failed to load assignments.", type: "error" });
      setLoading(false);
    });
  }, []);

  function handleGenerate() {
    setLoading(true);
    setToast({ show: false, message: "" });
    const username = localStorage.getItem("username");
    axios.post(`${be_url}/api/v1/genDoc/generate`, {
      username,
      selectedAssignments: assignments.filter(a => selectedIds.includes(a.id)),
      userDetails: {} // add name/rollNo if required
    }).then(res => {
      setJobId(res.data.jobId);
      setStatus("Queued");
      pollStatus(res.data.jobId);
    }).catch(() => {
      setToast({ show: true, message: "Failed to start document generation.", type: "error" });
      setLoading(false);
    });
  }

  function pollStatus(jobId) {
    let interval = setInterval(() => {
      axios.get(`${be_url}/api/v1/genDoc/status/${jobId}`).then(res => {
        setProgress(res.data.job.progress || 0);
        setStatus(res.data.job.status);
        if (["completed", "failed"].includes(res.data.job.status)) {
          clearInterval(interval);
        }
      });
    }, 3000);
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <AssignmentsList
        assignments={assignments}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        loading={loading}
      />
      <DocGeneration
        onGenerate={handleGenerate}
        loading={loading}
        canGenerate={selectedIds.length > 0 && selectedIds.length <= MAX_ASSIGNMENTS}
        maxCount={MAX_ASSIGNMENTS}
      />
      <StatusModal
        open={!!jobId}
        onClose={() => setJobId(null)}
        status={status}
        progress={progress}
      />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
