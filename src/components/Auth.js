import React, { useState } from 'react';
import { register, login } from '../services/api';
import { useTheme } from '../themes';
import { getFromIndexedDB } from '../utils/indexedDB';
import { useAuth } from '../AuthContext';

const Auth = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const { login: authLogin } = useAuth();

  const validateInput = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!validateInput()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email }); // Don't log password
      let userData;
      
      if (isLogin) {
        userData = await login(email, password);
        console.log('Login response:', userData);
        
        if (!userData || !userData.token) {
          throw new Error('Invalid response from server - missing token');
        }

        // First store the auth data
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userId', userData.userId);
        
        // Then initialize auth context
        console.log('Initializing auth context with:', userData);
        authLogin(userData.token, userData.userId);

        // Wait a moment to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // Only then close the modal
        onClose();

        // Force a page reload to ensure all components pick up the new auth state
        window.location.reload();
      } else {
        await register(email, password);
        console.log('Registration successful, attempting login');
        userData = await login(email, password);
        
        // Same process as above
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userId', userData.userId);
        authLogin(userData.token, userData.userId);
        await new Promise(resolve => setTimeout(resolve, 100));
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme.card} p-6 rounded-lg max-w-md relative`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 ${theme.text} ${theme.hover} p-2`}
        >
          ×
        </button>
        
        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>
          {isLogin ? 'Login' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block mb-2 ${theme.text}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${theme.input} px-3 py-2 rounded w-full`}
              placeholder="your@email.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className={`block mb-2 ${theme.text}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${theme.input} px-3 py-2 rounded w-full`}
              placeholder="••••••••"
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full disabled:opacity-50`}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className={`mt-4 text-center ${theme.text}`}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="underline hover:no-underline"
            disabled={isLoading}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
