// src/services/api.js
import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-server-url.com/api'
  : 'http://localhost:3001/api';

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } else {
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error(`Received non-JSON response: ${text}`);
  }
}

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json'
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    options.headers['User-ID'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, options);
  return handleResponse(response);
}

async function nonAuthRequest(url, options = {}) {
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json'
  };

  const response = await fetch(`${API_BASE_URL}${url}`, options);
  return handleResponse(response);
}

export async function register(email, password) {
  return request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email, password) {
  const data = await nonAuthRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.userId) {
    localStorage.setItem('userId', data.userId);
  }
  return data;
}

export async function getSharedSchedule(uniqueId) {
  return request(`/shared-schedule/${uniqueId}`);
}

export const getScheduleLibrary = async (id) => {
  console.log('Getting schedule library:', id);
  return request(`/schedule-library/${id}`);
};

export const updateLibraryName = async (id, name) => {
  console.log('Updating library name:', id, name);
  return request(`/schedule-library/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
};

export const searchPublicLibraries = async (searchTerm) => {
  console.log('Searching public libraries:', searchTerm);
  return request(`/public-libraries?search=${encodeURIComponent(searchTerm)}`);
};

export const mergeEmojiLibraries = async (sourceId, targetId) => {
  console.log('Merging emoji libraries:', sourceId, targetId);
  return request('/merge-emoji-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId, targetId }),
  });
};

export const deleteScheduleLibrary = async (id) => {
  console.log('Deleting schedule library:', id);
  return request(`/schedule-library/${id}`, { method: 'DELETE' });
};

export const saveSchedule = async (userId, libraryId, name, weekData, visibility, sharedWith) => {
  return request('/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, libraryId, name, weekData, visibility, sharedWith }),
  });
};

export async function getSchedule(scheduleId) {
  return request(`/schedules/${scheduleId}`);
}

export async function getSchedules(userId) {
  return request(`/schedules?userId=${userId}`);
}

export const getPublicSchedule = async (uniqueId) => {
  return request(`/schedules/public/${uniqueId}`);
};

export async function getPublicSchedules(searchTerm = '') {
  return request(`/schedules/public?search=${encodeURIComponent(searchTerm)}`);
}

export const saveEmojiLibrary = async (name, emojis, visibility, sharedWith) => {
  return request('/emoji-libraries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emojis, visibility, sharedWith }),
  });
};

export async function getEmojiLibraries(email = '') {
  return request(`/emoji-libraries?email=${encodeURIComponent(email)}`);
}

export async function createEmojiLibrary(name, emojis, visibility, sharedWith) {
  return request('/emoji-libraries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emojis, visibility, sharedWith }),
  });
}

export async function updateEmojiLibrary(id, name, emojis, visibility, sharedWith) {
  return request(`/emoji-libraries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emojis, visibility, sharedWith }),
  });
}

export async function deleteEmojiLibrary(id) {
  return request(`/emoji-libraries/${id}`, { method: 'DELETE' });
}

export async function createSchedule(library_id, week_data) {
  return request('/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ library_id, week_data }),
  });
}

export async function updateSchedule(id, name, libraryId, weekData, visibility, sharedWith) {
  return request(`/schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, libraryId, weekData, visibility, sharedWith }),
  });
}

export async function deleteSchedule(id) {
  return request(`/schedules/${id}`, { method: 'DELETE' });
}

export async function getUserEmojiLibraries(userId) {
  return request(`/emoji-libraries/user/${userId}`);
}

export const getPublicEmojiLibrary = async (uniqueId) => {
  return request(`/emoji-libraries/public/${uniqueId}`);
};

export async function getPublicEmojiLibraries(searchTerm = '') {
  return request(`/emoji-libraries/public?search=${encodeURIComponent(searchTerm)}`);
}

export const getData = async (dataSource) => {
  if (dataSource === 'local') {
    return getFromIndexedDB();
  } else {
    // Use an existing endpoint or create a new one
    return request('/user-data');
  }
};

export const saveData = async (data, dataSource) => {
  if (dataSource === 'local') {
    return saveToIndexedDB(data);
  } else {
    // Use an existing endpoint or create a new one
    return request('/user-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// Update saveScheduleLibrary function
export const saveScheduleLibrary = async (library) => {
  return request('/schedules', {
    method: 'POST',
    body: JSON.stringify(library),
  });
};
