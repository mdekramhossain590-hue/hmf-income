// This file connects the React app to the PHP api.php backend

const API_URL = 'https://hmfincome.site/api/api.php';

export const callApi = async (action: string, data: any = {}) => {
  try {
    const isGet = action === 'getDoc'; // query is POST because filters are complex
    
    let url = API_URL;
    const options: RequestInit = {
      method: isGet ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (isGet) {
      const params = new URLSearchParams({ action, ...data });
      url = `${API_URL}?${params.toString()}`;
    } else {
      options.body = JSON.stringify({ action, ...data });
    }
    
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Network response was not ok');
    
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
};
