export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}
