import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 12px;
  padding: 4rem;
  margin-left: 280px; /* Added to offset from the sidebar */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  /* Abstract background shapes */
  &:before {
    content: '';
    position: absolute;
    top: -200px;
    right: -100px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(52, 152, 219, 0.05), rgba(52, 152, 219, 0.1));
    z-index: 0;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -50px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(52, 152, 219, 0.05), rgba(52, 152, 219, 0.1));
    z-index: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    margin-left: 0;
    margin: 1rem;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    min-height: 60vh;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  padding: 0 1rem;
  margin: 0 auto;
`;

const Greeting = styled.h1`
  font-size: 3.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: 0.5px;
  font-weight: 700;
  background: linear-gradient(90deg, #1e293b, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Instruction = styled.p`
  font-size: 1.25rem;
  color: #475569;
  text-align: center;
  max-width: 600px;
  line-height: 1.7;
  margin: 0 auto;
  padding-bottom: 1rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2980b9);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const FeatureContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.7);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  color: #334155;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
`;

const DashboardHome = () => {
  return (
    <HomeContainer>
      <ContentWrapper>
        <Greeting>Hello, how are you?</Greeting>
        <Instruction>
          Select an option from the sidebar to get started. You can upload resumes, 
          schedule interviews, manage projects, and more.
        </Instruction>
        
        <FeatureContainer>
          <FeatureCard>
            <FeatureTitle>Resume Management</FeatureTitle>
            <FeatureDescription>
              Upload and analyze candidate resumes with AI-powered matching to find the best talent for your open positions.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Interview Scheduling</FeatureTitle>
            <FeatureDescription>
              Efficiently schedule and manage interviews with candidates, tracking progress throughout the hiring process.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Project Management</FeatureTitle>
            <FeatureDescription>
              Create and organize projects, assign team members, and track progress to ensure successful delivery.
            </FeatureDescription>
          </FeatureCard>
        </FeatureContainer>
      </ContentWrapper>
    </HomeContainer>
  );
};

export default DashboardHome;