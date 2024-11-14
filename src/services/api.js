import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB';
import { getAuthState } from '../AuthContext';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-server-url.com/api'
  : 'http://localhost:3001/api';

async function request(url, options = {}) {
  const { isAuthenticated, token } = getAuthState();
  
  if (!isAuthenticated) {
    console.warn('API call attempted while user is not authenticated');
    return null;
  }

  if (!token) {
    throw new Error('No authentication token available');
  }

  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    if (response.status === 403) {
      // Token might be expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.reload(); // Force a reload to reset auth state
      throw new Error('Authentication expired. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Public endpoints don't need authentication
async function publicRequest(url, options = {}) {
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Making request to:', `${API_BASE_URL}${url}`);
    console.log('Request options:', {
      ...options,
      body: options.body ? JSON.parse(options.body) : undefined
    });

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    const responseData = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.error?.message || `Request failed with status ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Public API request failed:', error);
    throw error;
  }
}

export async function register(email, password) {
  return publicRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email, password) {
  return publicRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getUserData() {
  return request('/user-data');
}

export async function saveUserData(userData) {
  return request('/user-data', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getSchedules() {
  return request('/schedules');
}

export async function getSchedule(scheduleId) {
  return request(`/schedules/${scheduleId}`);
}

export async function saveSchedule(scheduleData) {
  return request('/schedules', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });
}

export async function updateSchedule(id, scheduleData) {
  return request(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(scheduleData),
  });
}

export async function createSchedule(scheduleData) {
  return saveSchedule(scheduleData);
}

export async function getEmojiLibraries() {
  return request('/emoji-libraries');
}

export async function saveEmojiLibrary(libraryData) {
  return request('/emoji-libraries', {
    method: 'POST',
    body: JSON.stringify(libraryData),
  });
}

export async function getUserEmojiLibraries() {
  return getEmojiLibraries();
}

export async function deleteEmojiLibrary(id) {
  return request(`/emoji-libraries/${id}`, { method: 'DELETE' });
}

export async function getPublicSchedules(searchTerm = '') {
  return publicRequest(`/schedules/public?search=${encodeURIComponent(searchTerm)}`);
}

export async function getPublicEmojiLibraries(searchTerm = '') {
  return publicRequest(`/emoji-libraries/public?search=${encodeURIComponent(searchTerm)}`);
}

export async function getPublicSchedule(uniqueId) {
  return publicRequest(`/schedules/public/${uniqueId}`);
}

export async function getPublicEmojiLibrary(uniqueId) {
  return publicRequest(`/emoji-libraries/public/${uniqueId}`);
}

export async function getSharedSchedule(uniqueId) {
  return request(`/shared-schedule/${uniqueId}`);
}

export async function mergeEmojiLibraries(sourceId, targetId) {
  return request('/merge-emoji-library', {
    method: 'POST',
    body: JSON.stringify({ sourceId, targetId }),
  });
}

export async function deleteScheduleLibrary(id) {
  return request(`/schedule-library/${id}`, { method: 'DELETE' });
}

export const saveScheduleLibrary = async (library) => {
  return request('/schedules/library', {
    method: 'POST',
    body: JSON.stringify(library),
  });
};

export const getScheduleLibrary = async (id) => {
  return request(`/schedules/library/${id}`);
};

export const updateLibraryName = async (id, name) => {
  return request(`/schedules/library/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const getData = async (dataSource) => {
  try {
    if (dataSource === 'local') {
      return getFromIndexedDB();
    }
    
    // For server data, ensure we have authentication
    const { isAuthenticated, token } = getAuthState();
    if (!isAuthenticated || !token) {
      console.warn('Attempted to fetch server data without authentication');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/user-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data from server');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getData:', error);
    // If server request fails and we're trying to get server data,
    // fall back to local data
    if (dataSource === 'server') {
      console.log('Falling back to local data');
      return getFromIndexedDB();
    }
    return null;
  }
};

export const saveData = async (data, dataSource) => {
  if (dataSource === 'local') {
    return saveToIndexedDB(data);
  }
  
  try {
    return await request('/user-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error saving to server:', error);
    // Fallback to saving locally if server request fails
    return saveToIndexedDB(data);
  }
};
