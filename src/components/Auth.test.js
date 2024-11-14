// src/components/Auth.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import Auth from './Auth';

const mockOnClose = jest.fn();

const renderAuth = () => {
  return render(
    <AuthProvider>
      <Auth onClose={mockOnClose} />
    </AuthProvider>
  );
};

describe('Auth Component', () => {
  test('renders login form by default', () => {
    renderAuth();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('switches to registration form', () => {
    renderAuth();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    renderAuth();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles login failure', async () => {
    renderAuth();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });
});
