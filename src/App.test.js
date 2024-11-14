import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './AuthContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock the localStorage
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
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
};
global.indexedDB = indexedDB;

// Setup MSW server for API mocking
const server = setupServer(
  rest.get('/api/user-data', (req, res, ctx) => {
    return res(
      ctx.json({
        weekSchedule: {},
        emojiLibrary: [],
        currentLibraryId: null,
        currentLibraryName: '',
      })
    );
  }),
  rest.post('/api/user-data', (req, res, ctx) => {
    return res(ctx.json({ message: 'Data saved successfully' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});
afterAll(() => server.close());

// Wrap the component with necessary providers
const renderApp = () => {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

describe('App Component', () => {
  describe('Initial Render', () => {
    test('renders welcome message for new users', async () => {
      renderApp();
      expect(await screen.findByText(/Welcome to JSUsCH²R/i)).toBeInTheDocument();
    });

    test('renders theme selector', () => {
      renderApp();
      expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
    });

    test('renders login button when not authenticated', () => {
      renderApp();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    test('shows auth modal when clicking login button', async () => {
      renderApp();
      const loginButton = screen.getByRole('button', { name: /login/i });
      userEvent.click(loginButton);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('switches to registration form', async () => {
      renderApp();
      const loginButton = screen.getByRole('button', { name: /login/i });
      userEvent.click(loginButton);
      const registerLink = await screen.findByText(/register/i);
      userEvent.click(registerLink);
      expect(await screen.findByText(/create an account/i)).toBeInTheDocument();
    });
  });

  describe('Schedule Management', () => {
    test('loads default schedule when no saved data', async () => {
      renderApp();
      await waitFor(() => {
        expect(screen.getByText('Sleeping')).toBeInTheDocument();
      });
    });

    test('allows editing schedule items', async () => {
      renderApp();
      // Close intro modal if present
      const startButton = await screen.findByText('Get Started');
      userEvent.click(startButton);

      // Find and click an emoji in the schedule
      const sleepingEmoji = await screen.findByText('😴');
      userEvent.click(sleepingEmoji);

      // Verify edit popup appears
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('saves schedule changes', async () => {
      renderApp();
      const saveButton = await screen.findByText(/save locally/i);
      userEvent.click(saveButton);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Emoji Library', () => {
    test('displays default emoji library', async () => {
      renderApp();
      await waitFor(() => {
        expect(screen.getByText('🍲')).toBeInTheDocument();
      });
    });

    test('allows adding new emoji', async () => {
      renderApp();
      // Implementation depends on your UI for adding emojis
      // This is a placeholder test structure
    });
  });

  describe('Theme Management', () => {
    test('changes theme when selected', async () => {
      renderApp();
      const themeButton = screen.getByRole('button', { name: /theme/i });
      userEvent.click(themeButton);
      // Add assertions based on your theme implementation
    });
  });

  describe('Error Handling', () => {
    test('shows error notification on API failure', async () => {
      server.use(
        rest.get('/api/user-data', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      renderApp();
      expect(await screen.findByText(/failed to load data/i)).toBeInTheDocument();
    });
  });
});
