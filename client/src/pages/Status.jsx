import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StatusModal from "../components/StatusModal";
import axios from "axios";

export default function Status() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/v1/genDoc/status/${jobId}`);
        setStatus(res.data.job.status);
        setProgress(res.data.job.progress || 0);
        if (["completed", "failed"].includes(res.data.job.status)) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <StatusModal open={!!jobId} status={status} progress={progress} onClose={() => {}} />
    </div>
  );
}
