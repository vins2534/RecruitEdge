import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

// Define the API URL from environment variable, fallback to your ngrok URL
const apiUrl = process.env.REACT_APP_API_URL || 'https://0d8f-103-221-74-181.ngrok-free.app';

// Styled components for UI
const PageLayout = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  margin-left: 280px; /* Width of sidebar + spacing */
  background-color: #f8fafc;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-radius: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PromptInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  font-size: 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CandidateLabel = styled.label`
  font-size: 1.1rem;
  color: #4a5568;
  font-weight: 500;
`;

const CandidateInput = styled.input`
  width: 100%;
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

const FileInputButton = styled.button`
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
  gap: 0.5rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Message = styled.p`
  margin-top: 1.5rem;
  font-weight: 500;
  text-align: center;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: ${({ success }) => 
    success === true ? 'rgba(39, 174, 96, 0.1)' : 
    success === false ? 'rgba(231, 76, 60, 0.1)' : 'transparent'};
  color: ${({ success }) => 
    success === true ? '#27ae60' : 
    success === false ? '#e74c3c' : '#2c3e50'};
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1.5s linear infinite;
  margin: 20px auto;
`;

const JobDetailsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const JobTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const JobSkills = styled.p`
  margin-bottom: 0.5rem;
  line-height: 1.6;

  strong {
    color: #4a5568;
  }
`;

const Table = styled.table`
  width: 100%;
  margin-top: 2rem;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const Th = styled.th`
  background: #2c3e50;
  color: white;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 1rem;
  
  &:first-child {
    width: 60px;
  }
`;

const Td = styled.td`
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 0.95rem;
  background-color: white;
  
  &:first-child {
    font-weight: 500;
  }
`;

const TrWithHover = styled.tr`
  &:hover td {
    background-color: #f8fafc;
  }
`;

// CSV Download Function
const downloadCSV = (candidates, setMessage, setSuccess) => {
  if (candidates.length === 0) {
    setMessage("No candidates to export.");
    setSuccess(false);
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Name,Email,Output\n";
  candidates.forEach((candidate) => {
    csvContent += `${candidate.Name || "N/A"},${candidate.Email || "N/A"},${candidate.output || "N/A"}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Candidates_List.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ResumeUpload = () => {
  const [prompt, setPrompt] = useState('');
  const [openings, setOpenings] = useState(1);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('Candidates updated:', candidates);
  }, [candidates]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and immediately upload resumes
  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const pdfFiles = selectedFiles.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
      setMessage(`Selected ${pdfFiles.length} PDF file(s).`);
      setSuccess(null);
      await handleUpload(pdfFiles);
    } else {
      setFiles([]);
      setMessage('Please select PDF files only.');
      setSuccess(false);
    }
  };

  // Upload resumes and process them on the backend
  const handleUpload = async (selectedFiles) => {
    if (!prompt || !openings) {
      setMessage('Prompt and number of candidates are required.');
      setSuccess(false);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('openings', openings);
    selectedFiles.forEach(file => {
      formData.append('resumes', file);
    });

    try {
      const response = await axios.post(`${apiUrl}/process_resumes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Raw backend response:', response.data);

      let data = response.data;
      // If response is a string, try to extract JSON
      if (typeof data === 'string') {
        const start = data.indexOf('{');
        const end = data.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          data = JSON.parse(data.substring(start, end + 1));
          console.log('Parsed JSON from string response:', data);
        }
      }

      if (data && data.job_role && data.job_skills && data.candidates) {
        setJobDetails({ job_role: data.job_role, job_skills: data.job_skills });
        console.log('Candidates received from backend:', data.candidates);
        setCandidates(data.candidates);
        setMessage(`Processing complete. Found ${data.candidates.length} matching candidate(s).`);
        setSuccess(true);
      } else {
        console.error('Response data missing required keys:', data);
        setMessage('Error processing resumes. Please try again.');
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error processing resumes:', error);
      setMessage('Error processing resumes. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <Container>
        <Title>Resume Upload (HR)</Title>
        <StyledForm>
          <FormGroup>
            <PromptInput
              placeholder="Enter job posting prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <CandidateLabel htmlFor="openings">Number of Candidates:</CandidateLabel>
            <CandidateInput
              id="openings"
              type="number"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              min="1"
              required
            />
          </FormGroup>
          
          <FileInputButton type="button" onClick={handleButtonClick}>
            Upload Resumes
          </FileInputButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFileChange}
          />
        </StyledForm>

        {message && <Message success={success}>{message}</Message>}

        {loading && (
          <div>
            <Spinner />
            <p style={{ textAlign: 'center', color: '#4a5568' }}>Processing resumes, please wait...</p>
          </div>
        )}

        {jobDetails && !loading && (
          <JobDetailsContainer>
            <JobTitle>Job Role: {jobDetails.job_role}</JobTitle>
            <JobSkills><strong>Required Skills:</strong> {jobDetails.job_skills}</JobSkills>
          </JobDetailsContainer>
        )}

        {candidates.length > 0 && !loading && (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Type</Th>
                  <Th>Candidate Name</Th>
                  <Th>Email</Th>
                  <Th>Output</Th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <TrWithHover key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{candidate.type || "N/A"}</Td>
                    <Td>{candidate.Name || "N/A"}</Td>
                    <Td>{candidate.Email || "N/A"}</Td>
                    <Td>{candidate.output || "N/A"}</Td>
                  </TrWithHover>
                ))}
              </tbody>
            </Table>
            {/* CSV Download Button */}
            <FileInputButton type="button" onClick={() => downloadCSV(candidates, setMessage, setSuccess)}>
              Download CSV
            </FileInputButton>
          </>
        )}
      </Container>
    </MainContent>
  );
};

export default ResumeUpload;
