'use client';

import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import CourseSelection from '@/components/CourseSelection';
import AssignmentChecker from '@/components/AssignmentChecker';
import DocumentGenerator from '@/components/DocumentGenerator';
import { Course, CourseAssignments } from '@/types';

export default function HomePage() {
  const [currentFlow, setCurrentFlow] = useState<'login' | 'courses' | 'assignments' | 'documents'>('login');
  const [userData, setUserData] = useState<{ username: string; courses: Course[] } | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Record<string, CourseAssignments>>({});

  const handleLoginSuccess = (data: { username: string; courses: Course[] }) => {
    setUserData(data);
    setCurrentFlow('courses');
  };

  const handleCourseSelection = (courses: Course[]) => {
    setSelectedCourses(courses);
    setCurrentFlow('assignments');
  };

  const handleAssignmentsReady = (assignmentData: Record<string, CourseAssignments>) => {
    setAssignments(assignmentData);
    setCurrentFlow('documents');
  };

  switch (currentFlow) {
    case 'login':
      return <LoginForm onSuccess={handleLoginSuccess} />;
    
    case 'courses':
      return userData ? (
        <CourseSelection 
          courses={userData.courses} 
          username={userData.username}
          onNext={handleCourseSelection} 
        />
      ) : null;
    
    case 'assignments':
      return userData ? (
        <AssignmentChecker 
          selectedCourses={selectedCourses}
          username={userData.username}
          onNext={handleAssignmentsReady}
        />
      ) : null;
    
    case 'documents':
      return userData ? (
        <DocumentGenerator 
          assignments={assignments}
          username={userData.username}
        />
      ) : null;
    
    default:
      return <LoginForm onSuccess={handleLoginSuccess} />;
  }
}
