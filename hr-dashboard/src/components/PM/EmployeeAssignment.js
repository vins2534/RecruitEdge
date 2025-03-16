import React, { useState } from 'react';
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

// Form container
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const Button = styled.button`
  padding: 0.85rem 1.5rem;
  background-color: #3498db;
  color: #fff;
  border: none;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s ease, transform 0.1s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

// Message styling
const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #4a5568;
  margin: 1.5rem 0;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  color: #e74c3c;
  padding: 0.75rem;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
  margin: 1.5rem auto;
  max-width: 500px;
`;

// Assignment results card
const Card = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  margin: 2rem auto;
  border-left: 4px solid #3498db;
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
  font-weight: 600;
`;

const CardInfo = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 6px;
`;

const SubHeading = styled.h4`
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem 0;
  color: #2c3e50;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

const ListItem = styled.li`
  font-size: 1rem;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin: 0.5rem 0;
  border-left: 3px solid #3498db;
`;

const Label = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
  color: #4a5568;
  min-width: 160px;
  display: inline-block;
`;

const EmployeeAssignment = () => {
  const [projectId, setProjectId] = useState('');
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssignTeam = async () => {
    if (!projectId) {
      setError('Please enter a project ID.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`https://0d8f-103-221-74-181.ngrok-free.app/api/assign-team/${projectId}`);
      setAssignments(response.data.assignments);
    } catch (err) {
      setError('Error fetching team assignments. Please check the project ID.');
    }

    setLoading(false);
  };

  return (
    <MainContent>
      <Container>
        <Title>Employee Assignment</Title>

        <InputContainer>
          <Input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter Project ID"
          />
          <Button onClick={handleAssignTeam}>
            Assign Team
          </Button>
        </InputContainer>

        {loading && <LoadingMessage>Loading team assignments...</LoadingMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {assignments && (
          <Card>
            <CardTitle>Team Assignments for Project #{projectId}</CardTitle>
            
            <CardInfo>
              <Label>Frontend Developer:</Label>
              {assignments.frontend_developer ? assignments.frontend_developer.name : 'No suitable candidate found'}
            </CardInfo>
            
            <CardInfo>
              <Label>Backend Developer:</Label>
              {assignments.backend_developer ? assignments.backend_developer.name : 'No suitable candidate found'}
            </CardInfo>
            
            <SubHeading>AIML Engineers</SubHeading>
            {assignments.aiml_engineers && assignments.aiml_engineers.length > 0 ? (
              <List>
                {assignments.aiml_engineers.map((eng, index) => (
                  <ListItem key={index}>
                    {eng.name}
                  </ListItem>
                ))}
              </List>
            ) : (
              <CardInfo>No AIML Engineers found</CardInfo>
            )}
          </Card>
        )}
      </Container>
    </MainContent>
  );
};

export default EmployeeAssignment;