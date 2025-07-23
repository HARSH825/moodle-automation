'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, User, Hash, Loader2, CheckCircle } from 'lucide-react';
import { CourseAssignments, Assignment, GeneratedFile } from '@/types';
import { apiService } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import ProgressTracker from './ProgressTracker';

interface DocumentGeneratorProps {
  assignments: Record<string, CourseAssignments>;
  username: string;
}

export default function DocumentGenerator({ assignments, username }: DocumentGeneratorProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [userDetails, setUserDetails] = useState({
    name: '',
    rollNo: '',
  });
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [error, setError] = useState('');

  const handleAssignmentToggle = (assignment: Assignment, checked: boolean) => {
    if (checked) {
      if (selectedAssignments.length >= 5) {
        setError('Maximum 5 assignments allowed per request');
        return;
      }
      setSelectedAssignments(prev => [...prev, assignment]);
      setError('');
    } else {
      setSelectedAssignments(prev => prev.filter(a => a.id !== assignment.id));
    }
  };

  const startDocumentGeneration = async () => {
    if (selectedAssignments.length === 0) {
      setError('Please select at least one assignment');
      return;
    }

    if (!userDetails.name || !userDetails.rollNo) {
      setError('Please fill in your name and roll number');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await apiService.startDocumentGeneration(
        username, 
        selectedAssignments, 
        userDetails
      );
      
      if (response.success) {
        setCurrentJobId(response.jobId);
      } else {
        setError(response.error || 'Failed to start document generation');
        setIsGenerating(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Network error occurred');
      setIsGenerating(false);
    }
  };

  const handleJobComplete = (result: any) => {
    setIsGenerating(false);
    if (result?.generatedFiles) {
      setGeneratedFiles(result.generatedFiles);
    }
  };

  const handleJobError = (error: string) => {
    setIsGenerating(false);
    setError(error);
  };

  const getTotalAssignments = () => {
    return Object.values(assignments).reduce((total, course) => total + course.assignments.length, 0);
  };

  // Show progress tracker while generating
  if (isGenerating && currentJobId) {
    return (
      <div className="min-h-screen gradient-bg p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Generating Documents</CardTitle>
              <CardDescription>
                Creating professional documents for {selectedAssignments.length} assignments...
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ProgressTracker
            jobId={currentJobId}
            jobType="document"
            onComplete={handleJobComplete}
            onError={handleJobError}
          />
        </div>
      </div>
    );
  }

  // Show generated files
  if (generatedFiles.length > 0) {
    return (
      <div className="min-h-screen gradient-bg p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Documents Generated Successfully!</CardTitle>
                  <CardDescription>
                    {generatedFiles.length} professional documents have been created and are ready for download
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Generated Documents
              </CardTitle>
              <CardDescription>
                Click on any document to download it. Documents expire in 30 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedFiles.map((file, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{file.assignmentTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.fileName} ({formatFileSize(file.fileSize)})
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <a 
                        href={file.downloadUrl} 
                        download={file.fileName}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                  {index < generatedFiles.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="text-center py-6">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
              >
                Start Over
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Assignment selection and user details
  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate Documents
            </CardTitle>
            <CardDescription>
              Select assignments and provide your details to generate professional documents (Max 5 assignments)
            </CardDescription>
          </CardHeader>
        </Card>

        {/* User Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={userDetails.name}
                onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number / UID</Label>
              <Input
                id="rollNo"
                placeholder="Enter your roll number"
                value={userDetails.rollNo}
                onChange={(e) => setUserDetails(prev => ({ ...prev, rollNo: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Select Assignments ({getTotalAssignments()} available)
              </span>
              <Badge variant="secondary">
                {selectedAssignments.length}/5 selected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(assignments).map(([courseId, courseData]) => (
              <div key={courseId} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <h3 className="font-medium">{courseData.courseTitle}</h3>
                  <Badge variant="outline" className="text-xs">
                    {courseData.assignments.length} assignments
                  </Badge>
                </div>
                
                <div className="space-y-3 ml-4">
                  {courseData.assignments.map((assignment) => {
                    const isSelected = selectedAssignments.some(a => a.id === assignment.id);
                    const isDisabled = !isSelected && selectedAssignments.length >= 5;
                    
                    return (
                      <div 
                        key={assignment.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-primary/50' 
                            : isDisabled
                              ? 'bg-muted/30 border-border opacity-50'
                              : 'bg-muted/50 border-border hover:bg-muted/70'
                        }`}
                      >
                        <Checkbox
                          id={assignment.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) => 
                            handleAssignmentToggle(assignment, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={assignment.id}
                          className={`flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="font-medium">
                            {assignment.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: {assignment.submissionStatus || 'Not submitted'}
                          </div>
                        </label>
                        {isSelected && (
                          <Badge variant="default" className="ml-auto">
                            Selected
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="glass-card">
          <CardContent className="py-6">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <Button 
              onClick={startDocumentGeneration}
              disabled={isGenerating || selectedAssignments.length === 0}
              size="lg"
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Documents...
                </>
              ) : (
                <>
                  Generate {selectedAssignments.length} Document{selectedAssignments.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-3">
              Professional documents will be created with proper formatting, code sections, and conclusions
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
