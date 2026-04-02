import { api } from '@/shared/api/client';
import type { User } from '@/shared/types/models';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  person_type?: 'PF' | 'PJ';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  cpf?: string;
  cnpj?: string;
  company_name?: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/users/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/users/register', payload);
  return data;
}
