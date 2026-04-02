import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 500) {
      return 'O serviço está indisponível no momento. Tente novamente em instantes.';
    }

    const apiMessage = error.response?.data?.error;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
