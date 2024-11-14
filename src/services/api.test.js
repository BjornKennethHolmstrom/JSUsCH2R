import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as api from './api';
import { getAuthState } from '../AuthContext';

// Mock AuthContext
jest.mock('../AuthContext', () => ({
  getAuthState: jest.fn()
}));

// Mock IndexedDB utils
jest.mock('../utils/indexedDB', () => ({
  saveToIndexedDB: jest.fn(),
  getFromIndexedDB: jest.fn()
}));

const server = setupServer(
  // Auth endpoints
  rest.post('http://localhost:3001/api/register', (req, res, ctx) => {
    return res(ctx.json({ id: 'user123', message: 'User registered successfully' }));
  }),
  
  rest.post('http://localhost:3001/api/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'test-token', userId: 'user123' }));
  }),

  // User data endpoints
  rest.get('http://localhost:3001/api/user-data', (req, res, ctx) => {
    return res(ctx.json({
      weekSchedule: { Mon: [] },
      emojiLibrary: [],
      currentLibraryId: 'lib123',
      currentLibraryName: 'Test Library'
    }));
  }),

  // Schedule endpoints
  rest.get('http://localhost:3001/api/schedules', (req, res, ctx) => {
    return res(ctx.json([{ id: 'schedule123', name: 'Test Schedule' }]));
  }),

  rest.post('http://localhost:3001/api/schedules', (req, res, ctx) => {
    return res(ctx.json({ id: 'schedule123', name: 'New Schedule' }));
  }),

  // Emoji library endpoints
  rest.get('http://localhost:3001/api/emoji-libraries', (req, res, ctx) => {
    return res(ctx.json([{ id: 'emoji123', name: 'Test Emoji Library' }]));
  }),

  // Public endpoints
  rest.get('http://localhost:3001/api/schedules/public', (req, res, ctx) => {
    return res(ctx.json([{ id: 'public123', name: 'Public Schedule' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe('API Service', () => {
  describe('Authentication', () => {
    test('register successfully creates new user', async () => {
      const response = await api.register('test@example.com', 'password123');
      expect(response).toEqual({
        id: 'user123',
        message: 'User registered successfully'
      });
    });

    test('login returns token and userId', async () => {
      const response = await api.login('test@example.com', 'password123');
      expect(response).toEqual({
        token: 'test-token',
        userId: 'user123'
      });
    });

    test('handles registration failure', async () => {
      server.use(
        rest.post('http://localhost:3001/api/register', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({ error: 'Email already exists' }));
        })
      );

      await expect(api.register('test@example.com', 'password123'))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('Protected Endpoints', () => {
    beforeEach(() => {
      getAuthState.mockReturnValue({
        isAuthenticated: true,
        userId: 'user123',
        token: 'test-token'
      });
    });

    test('getUserData returns user data when authenticated', async () => {
      const data = await api.getUserData();
      expect(data).toEqual({
        weekSchedule: { Mon: [] },
        emojiLibrary: [],
        currentLibraryId: 'lib123',
        currentLibraryName: 'Test Library'
      });
    });

    test('getSchedules returns user schedules when authenticated', async () => {
      const schedules = await api.getSchedules();
      expect(schedules).toEqual([
        { id: 'schedule123', name: 'Test Schedule' }
      ]);
    });

    test('saveSchedule creates new schedule when authenticated', async () => {
      const scheduleData = { name: 'New Schedule', data: {} };
      const response = await api.saveSchedule(scheduleData);
      expect(response).toEqual({
        id: 'schedule123',
        name: 'New Schedule'
      });
    });

    test('returns null when not authenticated', async () => {
      getAuthState.mockReturnValue({
        isAuthenticated: false,
        userId: null,
        token: null
      });

      const response = await api.getUserData();
      expect(response).toBeNull();
    });
  });

  describe('Public Endpoints', () => {
    test('getPublicSchedules returns public schedules without auth', async () => {
      const schedules = await api.getPublicSchedules();
      expect(schedules).toEqual([
        { id: 'public123', name: 'Public Schedule' }
      ]);
    });

    test('getPublicSchedules with search term', async () => {
      const schedules = await api.getPublicSchedules('test');
      expect(schedules).toEqual([
        { id: 'public123', name: 'Public Schedule' }
      ]);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors', async () => {
      server.use(
        rest.get('http://localhost:3001/api/user-data', (req, res) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(api.getUserData()).rejects.toThrow();
    });

    test('handles API errors with error messages', async () => {
      server.use(
        rest.get('http://localhost:3001/api/user-data', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal server error' })
          );
        })
      );

      await expect(api.getUserData()).rejects.toThrow('Internal server error');
    });
  });

  describe('Data Source Management', () => {
    test('getData uses IndexedDB for local source', async () => {
      const mockData = { weekSchedule: {}, emojiLibrary: [] };
      require('../utils/indexedDB').getFromIndexedDB.mockResolvedValue(mockData);

      const result = await api.getData('local');
      expect(result).toEqual(mockData);
      expect(require('../utils/indexedDB').getFromIndexedDB).toHaveBeenCalled();
    });

    test('getData uses API for server source', async () => {
      getAuthState.mockReturnValue({
        isAuthenticated: true,
        userId: 'user123',
        token: 'test-token'
      });

      const result = await api.getData('server');
      expect(result).toEqual({
        weekSchedule: { Mon: [] },
        emojiLibrary: [],
        currentLibraryId: 'lib123',
        currentLibraryName: 'Test Library'
      });
    });
  });

  describe('Schedule Library Operations', () => {
    beforeEach(() => {
      getAuthState.mockReturnValue({
        isAuthenticated: true,
        userId: 'user123',
        token: 'test-token'
      });
    });

    test('mergeEmojiLibraries combines two libraries', async () => {
      server.use(
        rest.post('http://localhost:3001/api/merge-emoji-library', (req, res, ctx) => {
          return res(ctx.json({ message: 'Libraries merged successfully' }));
        })
      );

      const result = await api.mergeEmojiLibraries('source123', 'target123');
      expect(result).toEqual({ message: 'Libraries merged successfully' });
    });

    test('deleteScheduleLibrary removes library', async () => {
      server.use(
        rest.delete('http://localhost:3001/api/schedule-library/lib123', (req, res, ctx) => {
          return res(ctx.json({ message: 'Library deleted successfully' }));
        })
      );

      const result = await api.deleteScheduleLibrary('lib123');
      expect(result).toEqual({ message: 'Library deleted successfully' });
    });

    test('updateLibraryName updates library name', async () => {
      server.use(
        rest.put('http://localhost:3001/api/schedule-library/lib123', (req, res, ctx) => {
          return res(ctx.json({ message: 'Library name updated successfully' }));
        })
      );

      const result = await api.updateLibraryName('lib123', 'New Name');
      expect(result).toEqual({ message: 'Library name updated successfully' });
    });
  });
});
