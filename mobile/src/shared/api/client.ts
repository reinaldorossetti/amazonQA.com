import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/storage';

function resolveBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!envBaseUrl) {
    const fallback = Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api'
      : 'http://localhost:3001/api';

    console.warn(`[API] EXPO_PUBLIC_API_BASE_URL não configurada. Usando fallback: ${fallback}`);
    return fallback;
  }

  try {
    const url = new URL(envBaseUrl);

    if (Platform.OS === 'android' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      url.hostname = '10.0.2.2';
    }

    const path = url.pathname.replace(/\/+$/, '');
    if (!path) {
      url.pathname = '/api';
    } else if (!path.endsWith('/api')) {
      url.pathname = `${path}/api`;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    console.warn(`[API] EXPO_PUBLIC_API_BASE_URL inválida: "${envBaseUrl}". Usando fallback seguro.`);
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api'
      : 'http://localhost:3001/api';
  }
}

const baseURL = resolveBaseUrl();

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
