import { useState } from "react";
import axios from "axios";

export function useApi(initialUrl, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function fetch() {
    setLoading(true);
    setError(null);
    axios(initialUrl, options)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }

  return { data, loading, error, fetch };
}
