import { getErrorMessage } from '@/shared/utils/error';

describe('error utils', () => {
  it('returns friendly message for HTTP 500 errors', () => {
    const axios500Error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: {
          error: 'Internal Server Error',
        },
      },
      message: 'Request failed with status code 500',
    };

    const result = getErrorMessage(axios500Error);

    expect(result).toBe('O serviço está indisponível no momento. Tente novamente em instantes.');
  });

  it('keeps API message for non-500 axios errors', () => {
    const axios400Error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          error: 'Credenciais inválidas',
        },
      },
      message: 'Request failed with status code 400',
    };

    const result = getErrorMessage(axios400Error);

    expect(result).toBe('Credenciais inválidas');
  });
});
