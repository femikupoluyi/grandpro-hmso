import { FC, useEffect, useState } from 'react';
import axios from 'axios';

const HealthCheck: FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('https://backend-api-morphvm-wz7xxc7v.http.cloud.morph.so/health');
        setHealthStatus(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) return <div>Checking backend connection...</div>;
  if (error) return <div className="text-red-500">Backend connection error: {error}</div>;
  
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <h3 className="font-semibold text-green-800">✅ Backend Connected</h3>
      <p className="text-sm text-green-600 mt-1">
        Status: {healthStatus?.status} | 
        Version: {healthStatus?.version} | 
        Timezone: {healthStatus?.timezone}
      </p>
    </div>
  );
};

export default HealthCheck;
