'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { JobStatus } from '@/types';
import { apiService } from '@/lib/api';

interface ProgressTrackerProps {
  jobId: string;
  jobType: 'assignment' | 'document';
  onComplete: (result: any) => void;
  onError: (error: string) => void;
}

export default function ProgressTracker({ 
  jobId, 
  jobType, 
  onComplete, 
  onError 
}: ProgressTrackerProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = jobType === 'assignment' 
          ? await apiService.checkJobStatus(jobId)
          : await apiService.checkDocumentJobStatus(jobId);
        
        setJobStatus(response);

        if (response.status === 'completed') {
          clearInterval(pollInterval);
          onComplete(response.result);
        } else if (response.status === 'failed') {
          clearInterval(pollInterval);
          const errorMsg = response.failedReason || 'Job failed';
          setError(errorMsg);
          onError(errorMsg);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError('Failed to check job status');
        clearInterval(pollInterval);
        onError('Failed to check job status');
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [jobId, jobType, onComplete, onError]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Queued';
      case 'active':
        return jobType === 'assignment' ? 'Checking Assignments...' : 'Generating Documents...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'secondary' as const;
      case 'active':
        return 'default' as const;
      case 'completed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (!jobStatus && !error) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Initializing...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {jobStatus && getStatusIcon(jobStatus.status)}
          <span>
            {jobType === 'assignment' ? 'Assignment Check' : 'Document Generation'} Progress
          </span>
          {jobStatus && (
            <Badge variant={getStatusVariant(jobStatus.status)}>
              {getStatusText(jobStatus.status)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobStatus && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{jobStatus.progress}%</span>
              </div>
              <Progress value={jobStatus.progress} className="h-2" />
            </div>
            
            {jobStatus.status === 'active' && (
              <div className="text-sm text-muted-foreground">
                {jobType === 'assignment' 
                  ? 'Scanning courses for unsubmitted assignments...' 
                  : 'Creating professional documents...'}
              </div>
            )}
          </>
        )}
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {jobStatus?.status === 'completed' && (
          <div className="text-sm text-green-600 bg-green-500/10 p-3 rounded-lg">
            {jobType === 'assignment' 
              ? 'Assignment check completed successfully!'
              : 'Documents generated successfully!'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
