'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { Course, Assignment, CourseAssignments } from '@/types';
import { apiService } from '@/lib/api';
import ProgressTracker from './ProgressTracker';

interface AssignmentCheckerProps {
  selectedCourses: Course[];
  username: string;
  onNext: (assignments: Record<string, CourseAssignments>) => void;
}

export default function AssignmentChecker({ 
  selectedCourses, 
  username, 
  onNext 
}: AssignmentCheckerProps) {
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, CourseAssignments>>({});
  const [error, setError] = useState('');

  const startAssignmentCheck = async () => {
    setIsChecking(true);
    setError('');
    
    try {
      const selectedCourseIds = selectedCourses.map(course => course.id);
      const response = await apiService.startAssignmentCheck(username, selectedCourseIds);
      
      if (response.success) {
        setCurrentJobId(response.jobId);
      } else {
        setError(response.error || 'Failed to start assignment check');
        setIsChecking(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Network error occurred');
      setIsChecking(false);
    }
  };

  const handleJobComplete = async (result: any) => {
    setIsChecking(false);
    if (result?.nonSubmittedAssignments) {
      setAssignments(result.nonSubmittedAssignments);
    } else {
      // Fallback: fetch assignments directly
      try {
        const response = await apiService.getNonSubmittedAssignments(username);
        if (response.success) {
          setAssignments(response.assignments);
        }
      } catch (err) {
        setError('Failed to fetch assignments');
      }
    }
  };

  const handleJobError = (error: string) => {
    setIsChecking(false);
    setError(error);
  };

  const getTotalAssignments = () => {
    return Object.values(assignments).reduce((total, course) => total + course.assignments.length, 0);
  };

  const handleNext = () => {
    onNext(assignments);
  };

  // Show progress tracker while checking
  if (isChecking && currentJobId) {
    return (
      <div className="min-h-screen gradient-bg p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Checking Assignments</CardTitle>
              <CardDescription>
                Scanning {selectedCourses.length} courses for unsubmitted assignments...
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ProgressTracker
            jobId={currentJobId}
            jobType="assignment"
            onComplete={handleJobComplete}
            onError={handleJobError}
          />
        </div>
      </div>
    );
  }

  // Show results
  if (Object.keys(assignments).length > 0) {
    return (
      <div className="min-h-screen gradient-bg p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Assignment Results
              </CardTitle>
              <CardDescription>
                Found {getTotalAssignments()} unsubmitted assignments across {Object.keys(assignments).length} courses
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Assignment List */}
          <div className="space-y-4">
            {Object.entries(assignments).map(([courseId, courseData]) => (
              <Card key={courseId} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {courseData.courseTitle}
                    </CardTitle>
                    <Badge variant="secondary">
                      {courseData.assignments.length} pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courseData.assignments.map((assignment, index) => (
                    <div key={assignment.id} className="space-y-3">
                      <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {assignment.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {assignment.submissionStatus || 'Not submitted'}
                            </Badge>
                            {assignment.relatedFiles && assignment.relatedFiles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {assignment.relatedFiles.length} file{assignment.relatedFiles.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          {assignment.relatedFiles && assignment.relatedFiles.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Related Files:</div>
                              {assignment.relatedFiles.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center gap-2 text-sm">
                                  <Download className="w-3 h-3" />
                                  <span className="text-muted-foreground">{file.fileName}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={assignment.assignmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                        </Button>
                      </div>
                      
                      {index < courseData.assignments.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Button */}
          <Card className="glass-card">
            <CardContent className="flex items-center justify-between py-6">
              <div className="text-sm text-muted-foreground">
                Ready to generate documents for selected assignments
              </div>
              <Button 
                onClick={handleNext}
                size="lg"
                className="gap-2"
              >
                Generate Documents
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Initial state
  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Ready to Check Assignments</CardTitle>
            <CardDescription>
              Selected {selectedCourses.length} courses for assignment checking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {selectedCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-muted-foreground">ID: {course.id}</div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              onClick={startAssignmentCheck}
              disabled={isChecking}
              size="lg"
              className="w-full"
            >
              Start Assignment Check
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
