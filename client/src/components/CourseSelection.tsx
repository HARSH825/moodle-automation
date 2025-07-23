'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ArrowRight, CheckSquare } from 'lucide-react';
import { Course } from '@/types';

interface CourseSelectionProps {
  courses: Course[];
  username: string;
  onNext: (selectedCourses: Course[]) => void;
}

export default function CourseSelection({ courses, username, onNext }: CourseSelectionProps) {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  const handleCourseToggle = (course: Course, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, course]);
    } else {
      setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
    }
  };

  const handleNext = () => {
    if (selectedCourses.length > 0) {
      onNext(selectedCourses);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Select Courses</CardTitle>
                <CardDescription>
                  Welcome back, <span className="text-primary font-medium">{username}</span>. 
                  Choose courses to check for pending assignments.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Course Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Your Enrolled Courses ({courses.length})
            </CardTitle>
            <CardDescription>
              Select the courses you want to check for unsubmitted assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {courses.map((course) => {
                const isSelected = selectedCourses.some(c => c.id === course.id);
                return (
                  <div 
                    key={course.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'bg-muted/50 border-border hover:bg-muted/70'
                    }`}
                  >
                    <Checkbox
                      id={course.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleCourseToggle(course, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={course.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-foreground">
                        {course.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Course ID: {course.id}
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
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
              </div>
              <Button 
                onClick={handleNext}
                disabled={selectedCourses.length === 0}
                size="lg"
                className="gap-2"
              >
                Check Assignments
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
