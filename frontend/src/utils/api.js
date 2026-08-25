// Universal API Base URL resolver for IIS & Local Server Deployment
export const API_BASE_URL = (typeof window !== 'undefined' && window.location.port !== '3001')
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : '';

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return apiUrl(url);
};
