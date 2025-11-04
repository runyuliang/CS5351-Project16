// src/utils/auth.js

// 获取当前用户ID（基于token）
export function getCurrentUserId() {
  const token = getToken();
  if (!token) return null;

  try {
    // 从JWT token中解析用户ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // 用户ID
  } catch (error) {
    console.error('解析token失败:', error);
    return null;
  }
}

// 用户相关的存储键名
export function getUserStorageKey(key) {
  const userId = getCurrentUserId();
  if (userId) {
    return `user_${userId}_${key}`;
  }
  return key; // 如果没有用户ID，回退到全局键名
}

export function saveToken(token) {
  localStorage.setItem('access_token', token);
}

export function getToken() {
  let token = sessionStorage.getItem('access_token');
  if (token) {
    return token;
  }
  token = localStorage.getItem('access_token');
  return token;
}

export function saveUserInfo(userData) {
  const userId = getCurrentUserId();
  if (!userId) return;

  // 使用用户ID作为前缀保存用户信息
  if (userData.username) {
    localStorage.setItem(`user_${userId}_username`, userData.username);
    sessionStorage.setItem(`user_${userId}_username`, userData.username);
  }
  if (userData.email) {
    localStorage.setItem(`user_${userId}_email`, userData.email);
    sessionStorage.setItem(`user_${userId}_email`, userData.email);
  }
}

export function getUserInfo() {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const username = localStorage.getItem(`user_${userId}_username`) ||
                   sessionStorage.getItem(`user_${userId}_username`);
  const email = localStorage.getItem(`user_${userId}_email`) ||
                sessionStorage.getItem(`user_${userId}_email`);

  return username ? { username, email } : null;
}

export function logout() {
  const userId = getCurrentUserId();

  // 清除全局token
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');

  // 清除该用户的特定信息
  if (userId) {
    localStorage.removeItem(`user_${userId}_username`);
    localStorage.removeItem(`user_${userId}_email`);
    sessionStorage.removeItem(`user_${userId}_username`);
    sessionStorage.removeItem(`user_${userId}_email`);
  }

  // 清除其他全局信息
  localStorage.removeItem('rememberMe');
}

export function isRememberMe() {
  return localStorage.getItem('rememberMe') === 'true';
}