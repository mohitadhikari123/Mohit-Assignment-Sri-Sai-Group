import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import socketService from './socket';
import { loadUserFromToken } from './redux/slices/authSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const user = useSelector(state => state.auth.user);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    dispatch(loadUserFromToken()).finally(() => {
      setIsInitialized(true);
    });
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  if (!isInitialized) {
    return <div>Loading application...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
