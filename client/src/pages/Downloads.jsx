import { useEffect, useState } from "react";
import axios from "axios";
const be_url = "http://localhost:4000";
export default function Downloads() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    axios.get(`${be_url}/api/v1/genDoc/downloads?username=${username}`).then(res => {
      setDocs(res.data.docs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6 text-primary">Recent Generated Documents</h2>
      {loading ? (
        <div className="text-subtext">Loading...</div>
      ) : (
        <ul className="bg-card rounded p-6">
          {docs.map(doc => (
            <li key={doc.fileName} className="py-2 border-b border-neutral-700 flex justify-between items-center">
              <span>{doc.assignmentTitle}</span>
              <a href={doc.downloadUrl} className="text-primary hover:underline ml-4" download>
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
