import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: linear-gradient(180deg, #1a2a3a, #2c3e50);
  color: #f8fafc;
  padding: 24px 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
`;

const Title = styled.h2`
  margin: 0 0 32px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: center;
  color: #f8fafc;
  padding-bottom: 16px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: #3498db;
    border-radius: 2px;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  flex: 1;
  margin: 0;
`;

const SectionTitle = styled.li`
  font-weight: 600;
  margin: 24px 0 12px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  padding-left: 12px;
`;

const NavItem = styled.li`
  margin: 4px 0;
`;

const StyledLink = styled(Link)`
  color: #e2e8f0;
  text-decoration: none;
  font-size: 15px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;

  /* Animated indicator */
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: #3498db;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateX(4px);
    
    &:before {
      transform: scaleY(1);
    }
  }
  
  &.active {
    background: rgba(52, 152, 219, 0.3);
    color: #fff;
    font-weight: 500;
    
    &:before {
      transform: scaleY(1);
    }
  }
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
  margin: 16px 0;
`;

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarContainer>
      <Title>Dashboard</Title>
      <NavList>
        <SectionTitle>HR</SectionTitle>
        <NavItem>
          <StyledLink 
            to="/resume-upload" 
            className={currentPath === '/resume-upload' ? 'active' : ''}
          >
            Resume Upload
          </StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink 
            to="/interview-scheduler"
            className={currentPath === '/interview-scheduler' ? 'active' : ''}
          >
            Interview Scheduler
          </StyledLink>
        </NavItem>
        <Divider />
        <SectionTitle>Project Manager</SectionTitle>
        <NavItem>
          <StyledLink 
            to="/project-creation"
            className={currentPath === '/project-creation' ? 'active' : ''}
          >
            Project Creation
          </StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink 
            to="/employee-assignment"
            className={currentPath === '/employee-assignment' ? 'active' : ''}
          >
            Employee Assignment
          </StyledLink>
        </NavItem>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
