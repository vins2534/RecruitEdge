// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ResumeUpload from './components/HR/ResumeUpload';
import InterviewScheduler from './components/HR/InterviewScheduler';
import ProjectCreation from './components/PM/ProjectCreation';
import EmployeeAssignment from './components/PM/EmployeeAssignment';
import ProjectList from './components/ProjectList';
import DashboardHome from './components/DashboardHome'; // New default dashboard component
function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/resume-upload" element={<ResumeUpload />} />
            <Route path="/interview-scheduler" element={<InterviewScheduler />} />
            <Route path="/project-creation" element={<ProjectCreation />} />
            <Route path="/employee-assignment" element={<EmployeeAssignment />} />
            <Route path="/projects" element={<ProjectList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
