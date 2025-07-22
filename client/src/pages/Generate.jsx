import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocGeneration from "../components/DocGeneration";
import StatusModal from "../components/StatusModal";
import Toast from "../components/Toast";
import axios from "axios";

export default function Generate() {
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const navigate = useNavigate();
    const be_url ="http://localhost:4000";
  async function handleGenerate() {
    setLoading(true);
    setToast({ show: false });
    try {
      const username = localStorage.getItem("username");
      const userDetails = {}; // name, rollNo, etc. if needed
      const res = await axios.post(`${be_url}/api/v1/genDoc/generate`, {
        username,
        selectedAssignments,
        userDetails,
      });
      setJobId(res.data.jobId);
      setStatus("queued");
      pollStatus(res.data.jobId);
    } catch (e) {
      setToast({ show: true, message: e?.response?.data?.error || "Generation failed.", type: "error" });
      setLoading(false);
    }
  }

  function pollStatus(jobId) {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${be_url}/api/v1/genDoc/status/${jobId}`);
        setStatus(res.data.job.status);
        setProgress(res.data.job.progress || 0);
        if (res.data.job.status === "completed" || res.data.job.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setToast({
            show: true,
            message: res.data.job.status === "completed" ? "Document ready!" : "Generation failed.",
            type: res.data.job.status === "completed" ? "success" : "error",
          });
          if (res.data.job.status === "completed") {
            navigate("/downloads");
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 3500);
  }

  return (
    <div className="flex flex-col items-center py-12">
      <DocGeneration
        onGenerate={handleGenerate}
        loading={loading}
        canGenerate={selectedAssignments.length > 0}
        maxCount={5}
      />
      <StatusModal open={!!jobId} status={status} progress={progress} onClose={() => setJobId("")} />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
