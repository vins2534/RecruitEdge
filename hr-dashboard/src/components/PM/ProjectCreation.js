import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Layout components
const MainContent = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  margin-left: 280px; /* Width of sidebar + spacing */
  background-color: #f8fafc;
`;

// Styled container for the page
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-radius: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Page title
const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

// Table styling
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const TableHead = styled.thead`
  background: #2c3e50;
  color: white;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
`;

// Form Styling
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.1rem;
  color: #4a5568;
  font-weight: 500;
`;

// Input and Textarea Styling
const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

// Submit Button
const Button = styled.button`
  padding: 0.85rem 1.5rem;
  background-color: #3498db;
  color: #fff;
  border: none;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

// Success Message
const Message = styled.p`
  margin-top: 1.5rem;
  font-weight: 500;
  text-align: center;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: rgba(39, 174, 96, 0.1);
  color: #27ae60;
`;

// Section divider
const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ProjectCreation = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = 'http://127.0.0.1:5000/api/projects';

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newProjectData = {
      name: projectName,
      description: description,
      required_skill: skills,
    };

    axios.post(API_URL, newProjectData)
      .then(response => {
        const project_id = response.data.project_id;
        const newProject = {
          id: project_id,
          name: projectName,
          description: description,
        };
        setProjects([...projects, newProject]);
        setMessage(`Project "${projectName}" created successfully!`);
        setProjectName('');
        setDescription('');
        setSkills('');
      })
      .catch(error => {
        console.error("Error creating project:", error);
        setMessage("Error creating project");
      });
  };

  return (
    <MainContent>
      <Container>
        <Title>Project Creation (PM)</Title>
        
        <SectionTitle>Current Projects</SectionTitle>
        {/* Display projects in a table format */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Project ID</TableHeader>
              <TableHeader>Project Name</TableHeader>
              <TableHeader>Description</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.id}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" style={{ textAlign: 'center' }}>No projects available</TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>

        <Divider />
        <SectionTitle>Create New Project</SectionTitle>
        
        {/* Project creation form */}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Project Description</Label>
            <TextArea
              id="description"
              placeholder="Enter detailed project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="skills">Required Skills</Label>
            <Input
              id="skills"
              type="text"
              placeholder="e.g. React, Node.js, Python"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </FormGroup>
          
          <Button type="submit">Create Project</Button>
        </Form>
        {message && <Message>{message}</Message>}
      </Container>
    </MainContent>
  );
};

export default ProjectCreation;