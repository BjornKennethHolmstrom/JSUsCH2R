import { rest } from 'msw';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-server-url.com/api'
  : 'http://localhost:3001/api';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/register`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'test-user-id',
        message: 'User registered successfully'
      })
    );
  }),

  rest.post(`${API_BASE_URL}/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'test-token',
        userId: 'test-user-id'
      })
    );
  }),

  // User data endpoints
  rest.get(`${API_BASE_URL}/user-data`, (req, res, ctx) => {
    return res(
      ctx.json({
        weekSchedule: {},
        emojiLibrary: [],
        currentLibraryId: 'test-library-id',
        currentLibraryName: 'Test Library'
      })
    );
  }),

  rest.post(`${API_BASE_URL}/user-data`, (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'User data saved successfully'
      })
    );
  }),

  // Schedule endpoints
  rest.get(`${API_BASE_URL}/schedules`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'test-schedule-id',
          name: 'Test Schedule',
          weekData: {}
        }
      ])
    );
  }),

  // Emoji library endpoints
  rest.get(`${API_BASE_URL}/emoji-libraries`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'test-library-id',
          name: 'Test Library',
          emojis: []
        }
      ])
    );
  }),

  // Public endpoints
  rest.get(`${API_BASE_URL}/schedules/public`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          unique_id: 'public-schedule-id',
          name: 'Public Schedule',
          user_email: 'test@example.com'
        }
      ])
    );
  }),
];
