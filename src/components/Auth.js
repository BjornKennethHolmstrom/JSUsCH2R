// src/components/Auth.js

import React, { useState } from 'react';
import { register, login } from '../services/api';
import { useTheme } from '../themes';

const Auth = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let userData;
      if (isLogin) {
        userData = await login(email, password);
      } else {
        await register(email, password);
        userData = await login(email, password);
      }
      if (userData.token) {
        onLogin(userData);
        onClose();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${theme.card} p-6 rounded-lg max-w-md relative`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 ${theme.text} ${theme.hover}`}
        >
          &times;
        </button>
        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${theme.input} px-2 py-1 rounded w-full mb-4`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${theme.input} px-2 py-1 rounded w-full mb-4`}
            required
          />
          <button type="submit" className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full`}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className={`mt-4 ${theme.text}`}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="underline">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
