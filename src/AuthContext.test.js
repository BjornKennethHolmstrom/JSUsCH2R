import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth, getAuthState } from './AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    test('provides initial unauthenticated state', () => {
      let authState;
      
      const TestComponent = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(authState).toEqual(expect.objectContaining({
        isAuthenticated: false,
        userId: null,
        token: null
      }));
    });

    test('loads authentication state from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', 'test-user');

      let authState;
      
      const TestComponent = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(authState).toEqual(expect.objectContaining({
        isAuthenticated: true,
        userId: 'test-user',
        token: 'test-token'
      }));
    });
  });

  describe('useAuth hook', () => {
    test('login updates authentication state and localStorage', () => {
      let auth;
      
      const TestComponent = () => {
        auth = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        auth.login('test-token', 'test-user');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'test-user');
      expect(auth).toEqual(expect.objectContaining({
        isAuthenticated: true,
        userId: 'test-user',
        token: 'test-token'
      }));
    });

    test('logout clears authentication state and localStorage', () => {
      let auth;
      
      const TestComponent = () => {
        auth = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        auth.login('test-token', 'test-user');
        auth.logout();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
      expect(auth).toEqual(expect.objectContaining({
        isAuthenticated: false,
        userId: null,
        token: null
      }));
    });
  });

  describe('getAuthState', () => {
    test('returns correct authentication state from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', 'test-user');

      const state = getAuthState();

      expect(state).toEqual({
        isAuthenticated: true,
        userId: 'test-user',
        token: 'test-token'
      });
    });

    test('returns unauthenticated state when localStorage is empty', () => {
      const state = getAuthState();

      expect(state).toEqual({
        isAuthenticated: false,
        userId: null,
        token: null
      });
    });
  });
});
