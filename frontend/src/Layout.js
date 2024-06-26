import React from 'react';
import { Navbar } from './Components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const styles = {
  app: {
    height: '100%',
    margin: 0,
    backgroundColor: '#FBFFFF', // Background color from the provided CSS
    color: '#476B70', // Default text color
    fontFamily: 'Inter, Helvetica, Arial, sans-serif', // Add font-family for consistency
  },
  navigationBarContainer: {
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '64px', 
    backgroundColor: '#FBFFFF',
  },
  main: {
    paddingTop: '20px',
    paddingBottom: '20px',
    backgroundColor: '#FBFFFF', // Background color from the provided CSS
    minHeight: 'calc(100vh - 64px)', // Adjust height to fill the screen minus navbar
  },
};

export function Layout(props) {
  return (
    <div style={styles.app}>
        <div style={styles.navigationBarContainer}>
          <Navbar loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn} />
        </div>
      <Container component="main" style={styles.main}>
        <Outlet />
      </Container>
    </div>
  );
}
