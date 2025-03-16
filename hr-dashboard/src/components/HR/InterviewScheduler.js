import React, { useState, useRef } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

// Define the API URL from environment variable, fallback to your ngrok URL
const apiUrl = process.env.REACT_APP_API_URL || 'https://0d8f-103-221-74-181.ngrok-free.app';

// Layout container for overall page
const MainContent = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  margin-left: 280px;
  background-color: #f0f4f8;
  min-height: 100vh;
`;

// Styled container for scheduler content
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const HeaderSection = styled.div`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(to right, #f0f4f8, #e6f2ff);
  border-bottom: 1px solid #e0e7ff;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #636e72;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  padding: 2rem;
`;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  font-size: 1rem;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const UploadButton = styled.button`
  padding: 0.9rem;
  background-color: #3498db;
  color: #fff;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  grid-column: 1 / -1;
  padding: 1rem;
  background-color: #2c3e50;
  color: #fff;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  &:hover {
    background-color: #34495e;
    transform: translateY(-1px);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 3px solid rgba(52, 152, 219, 0.1);
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const Message = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ success }) =>
    success === true ? 'rgba(39, 174, 96, 0.1)' : 
    success === false ? 'rgba(231, 76, 60, 0.1)' : 'transparent'};
  color: ${({ success }) =>
    success === true ? '#27ae60' : 
    success === false ? '#e74c3c' : '#2c3e50'};
  border-left: 4px solid ${({ success }) =>
    success === true ? '#27ae60' : 
    success === false ? '#e74c3c' : 'transparent'};
`;

const DownloadLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    background-color: #27ae60;
    transform: translateY(-1px);
  }
`;

const FileNameDisplay = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #636e72;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: #4a5568;
  font-size: 1rem;
`;

const InterviewScheduler = () => {
  const [startDate, setStartDate] = useState('');
  const [slotLength, setSlotLength] = useState('');
  const [breakTime, setBreakTime] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      setSuccess(null);
    } else {
      setFile(null);
      setFileName('');
      setMessage('Please select a CSV file.');
      setSuccess(false);
    }
  };

  const handleSchedule = async (event) => {
    event.preventDefault();
    if (!startDate || !slotLength || !breakTime || !file) {
      setMessage('Please fill in all fields and upload a CSV file.');
      setSuccess(false);
      return;
    }
    setLoading(true);
    const formData = new FormData();

    const fstartDate = new Date(startDate);
    const formattedStartDate = fstartDate.toISOString().slice(0, 16).replace('T', ' ');
    
    formData.append('start_date', formattedStartDate);
    formData.append('slot_length', slotLength);
    formData.append('break_time', breakTime);
    formData.append('file', file);

    try {
      const response = await axios.post(`${apiUrl}/api/schedule`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.status === 200) {
        setSuccess(true);
        setMessage('Interview slots scheduled successfully!');
        setDownloadLink(response.data.file_url);
      } else {
        setSuccess(false);
        setMessage('Failed to schedule interviews. Please try again.');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      setMessage('Error processing request. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <Container>
        <HeaderSection>
          <Title>Interview Scheduler</Title>
          <Subtitle>
            Efficiently schedule interviews with candidates by setting up time slots and automated communication.
          </Subtitle>
        </HeaderSection>
        
        <FormSection>
          <StyledForm onSubmit={handleSchedule}>
            <FormGroup>
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="slotLength">Interview Duration (minutes)</Label>
              <Input
                id="slotLength"
                type="number"
                value={slotLength}
                onChange={(e) => setSlotLength(e.target.value)}
                min="1"
                placeholder="e.g. 30"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="breakTime">Break Between Interviews (minutes)</Label>
              <Input
                id="breakTime"
                type="number"
                value={breakTime}
                onChange={(e) => setBreakTime(e.target.value)}
                min="0"
                placeholder="e.g. 10"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Candidate List</Label>
              <UploadButton type="button" onClick={handleButtonClick}>
                Upload CSV File
              </UploadButton>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              {fileName && <FileNameDisplay>Selected: {fileName}</FileNameDisplay>}
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Send Interview Calls'}
            </SubmitButton>
          </StyledForm>

          {message && <Message success={success}>{message}</Message>}

          {loading && (
            <LoadingContainer>
              <Spinner />
              <LoadingText>Scheduling interviews, please wait...</LoadingText>
            </LoadingContainer>
          )}

          {downloadLink && !loading && success && (
            <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
              <DownloadLink href={downloadLink} download>
                Download Scheduled Slots
              </DownloadLink>
            </div>
          )}
        </FormSection>
      </Container>
    </MainContent>
  );
};

export default InterviewScheduler;