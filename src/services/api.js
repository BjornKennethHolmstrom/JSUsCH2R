const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-server-url.com/api'
  : 'http://localhost:3001/api';

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'An unexpected error occurred');
    }
    return data;
  } else {
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error('Received non-JSON response from server');
  }
}

export const saveScheduleLibrary = async (library) => {
  console.log('Saving schedule library:', library);
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(library),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error saving schedule library:', error);
    throw error;
  }
};

export const getScheduleLibrary = async (id) => {
  console.log('Getting schedule library:', id);
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-library/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting schedule library:', error);
    throw error;
  }
};

export const updateLibraryName = async (id, name) => {
  console.log('Updating library name:', id, name);
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-library/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating library name:', error);
    throw error;
  }
};

export const searchPublicLibraries = async (searchTerm) => {
  console.log('Searching public libraries:', searchTerm);
  try {
    const response = await fetch(`${API_BASE_URL}/public-libraries?search=${encodeURIComponent(searchTerm)}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching public libraries:', error);
    throw error;
  }
};

export const mergeEmojiLibraries = async (sourceId, targetId) => {
  console.log('Merging emoji libraries:', sourceId, targetId);
  try {
    const response = await fetch(`${API_BASE_URL}/merge-emoji-library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceId, targetId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error merging emoji libraries:', error);
    throw error;
  }
};

export const deleteScheduleLibrary = async (id) => {
  console.log('Deleting schedule library:', id);
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-library/${id}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting schedule library:', error);
    throw error;
  }
};
