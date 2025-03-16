// src/components/ProjectsList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for a clean look
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const ProjectItem = styled.div`
  border: 1px solid #e0e0e0;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  background: #f9f9f9;
`;

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from your Flask API endpoint
    axios.get('http://127.0.0.1:5000/api/projects')
      .then(response => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Container>Loading projects...</Container>;
  if (error) return <Container>Error: {error.message}</Container>;

  return (
    <Container>
      <Title>Projects List</Title>
      {projects.map(project => (
        <ProjectItem key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <p><strong>Required Skills:</strong> {project.skills}</p>
        </ProjectItem>
      ))}
    </Container>
  );
};

export default ProjectsList;
