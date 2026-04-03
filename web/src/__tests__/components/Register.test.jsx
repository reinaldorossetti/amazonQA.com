import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../../components/Register';
import { BrowserRouter } from 'react-router-dom';
import { registerUser } from '../../db/api';
import { toast } from 'react-toastify';

const navigateMock = vi.fn();

vi.mock('../../db/api', () => ({
  registerUser: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useRealTimers();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          logradouro: 'Praça da Sé',
          bairro: 'Sé',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
    });
  });

  const fillStep0PF = async (user) => {
    await user.type(screen.getByLabelText('Nome *'), 'Joao');
    await user.type(screen.getByLabelText('Sobrenome *'), 'Silva');
    await user.type(screen.getByLabelText('CPF *'), '52998224725');
    await user.type(screen.getByLabelText('Email *'), 'joao@email.com');
    await user.type(screen.getByLabelText('Telefone / WhatsApp *'), '11987654321');
    await user.type(screen.getByLabelText('Senha *'), 'Aa123456!');
    await user.type(screen.getByLabelText('Confirmar Senha *'), 'Aa123456!');
  };

  describe('Register flows', () => {
    it('TC_REG_001: Renderiza step inicial com botão próximo e link de login', () => {
      renderWithRouter(<Register />);
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Próximo: Endereço/i })).toBeInTheDocument();
      expect(screen.getByText(/Já tem uma conta\?/i)).toBeInTheDocument();
    });

    it('TC_REG_002: Mostra erros obrigatórios ao avançar sem preencher', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      expect(await screen.findByText('Nome é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('Sobrenome é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('Email inválido.')).toBeInTheDocument();
      expect(screen.getByText('CPF inválido.')).toBeInTheDocument();
    });

    it('TC_REG_003: Alterna para PJ e exibe campos de Razão Social/CNPJ', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.click(screen.getByRole('button', { name: /Pessoa Jurídica/i }));

      expect(screen.getByLabelText('Razão Social *')).toBeInTheDocument();
      expect(screen.getByLabelText('CNPJ *')).toBeInTheDocument();
    });

    it('TC_REG_004: Avança para step 1 quando dados PF são válidos', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      expect(await screen.findByLabelText('CEP *')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument();
    });

    it('TC_REG_005: Bloqueia avanço com CPF inválido', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.type(screen.getByLabelText('Nome *'), 'Joao');
      await user.type(screen.getByLabelText('Sobrenome *'), 'Silva');
      await user.type(screen.getByLabelText('CPF *'), '11111111111');
      await user.type(screen.getByLabelText('Email *'), 'joao@email.com');
      await user.type(screen.getByLabelText('Telefone / WhatsApp *'), '11987654321');
      await user.type(screen.getByLabelText('Senha *'), 'Aa123456!');
      await user.type(screen.getByLabelText('Confirmar Senha *'), 'Aa123456!');

      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      expect(await screen.findByText('CPF inválido.')).toBeInTheDocument();
      expect(screen.queryByLabelText('CEP *')).not.toBeInTheDocument();
    });

    it('TC_REG_006: Exibe força da senha dinamicamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.type(screen.getByLabelText('Senha *'), 'abc');
      expect(screen.getByText('Fraca')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Senha *'));
      await user.type(screen.getByLabelText('Senha *'), 'Aa123456!');
      expect(screen.getByText('Forte')).toBeInTheDocument();
    });

    it('TC_REG_007: Auto-preenche endereço via CEP', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      const cepInput = await screen.findByLabelText('CEP *');
      await user.type(cepInput, '01001000');

      await waitFor(() => {
        expect(screen.getByLabelText('Logradouro *')).toHaveValue('Praça da Sé');
        expect(screen.getByLabelText('Cidade *')).toHaveValue('São Paulo');
        expect(screen.getByLabelText('UF *')).toHaveValue('SP');
      });
    });

    it('TC_REG_008: Submete com sucesso e chama registerUser com payload normalizado', async () => {
      const user = userEvent.setup();
      registerUser.mockResolvedValueOnce({ id: 1 });

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');
      await user.type(screen.getByLabelText('Número *'), '100');

      await user.click(screen.getByRole('button', { name: /Criar Conta/i }));

      await waitFor(() => expect(registerUser).toHaveBeenCalledTimes(1));
      expect(registerUser).toHaveBeenCalledWith(
        expect.objectContaining({
          person_type: 'PF',
          first_name: 'Joao',
          last_name: 'Silva',
          email: 'joao@email.com',
          cpf: expect.any(String),
          cnpj: null,
        })
      );
      expect(toast.success).toHaveBeenCalled();
    });

    it('TC_REG_009: Mostra toast de erro quando registerUser falha', async () => {
      const user = userEvent.setup();
      registerUser.mockRejectedValueOnce(new Error('Email já cadastrado'));

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');
      await user.type(screen.getByLabelText('Número *'), '100');

      await user.click(screen.getByRole('button', { name: /Criar Conta/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email já cadastrado');
      });
    });

    it('TC_REG_010: No step 1, voltar retorna para step 0', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));
      expect(await screen.findByLabelText('CEP *')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Voltar/i }));
      expect(await screen.findByLabelText('Nome *')).toBeInTheDocument();
    });

    it('TC_REG_011: Em PJ, bloqueia avanço sem Razão Social/CNPJ válidos', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.click(screen.getByRole('button', { name: /Pessoa Jurídica/i }));
      await user.type(screen.getByLabelText('Nome *'), 'Carlos');
      await user.type(screen.getByLabelText('Sobrenome *'), 'Souza');
      await user.type(screen.getByLabelText('CNPJ *'), '11111111111111');
      await user.type(screen.getByLabelText('Email Corporativo *'), 'corp@email.com');
      await user.type(screen.getByLabelText('Telefone / WhatsApp *'), '11987654321');
      await user.type(screen.getByLabelText('Senha *'), 'Aa123456!');
      await user.type(screen.getByLabelText('Confirmar Senha *'), 'Aa123456!');

      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      expect(await screen.findByText('CNPJ inválido.')).toBeInTheDocument();
      expect(screen.getByText('Razão Social é obrigatória.')).toBeInTheDocument();
      expect(screen.queryByLabelText('CEP *')).not.toBeInTheDocument();
    });

    it('TC_REG_012: CEP não encontrado exibe erro específico', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ erro: true }),
      });

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');

      expect(await screen.findByText('CEP não encontrado.')).toBeInTheDocument();
    });

    it('TC_REG_013: Falha de rede no CEP exibe erro genérico', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockRejectedValue(new Error('network down'));

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');

      expect(await screen.findByText('Erro ao buscar CEP.')).toBeInTheDocument();
    });

    it('TC_REG_014: Exige campos obrigatórios do step 1 no submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));
      await user.click(screen.getByRole('button', { name: /Criar Conta/i }));

      expect(await screen.findByText('CEP obrigatório (8 dígitos).')).toBeInTheDocument();
      expect(screen.getByText('Logradouro é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('Número é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('Cidade é obrigatória.')).toBeInTheDocument();
      expect(screen.getByText('Estado é obrigatório.')).toBeInTheDocument();
      expect(registerUser).not.toHaveBeenCalled();
    });

    it('TC_REG_015: Sucesso no cadastro navega para home após timeout', async () => {
      const user = userEvent.setup();
      const timeoutSpy = vi.spyOn(global, 'setTimeout');
      registerUser.mockResolvedValueOnce({ id: 1 });

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');
      await waitFor(() => {
        expect(screen.getByLabelText('Cidade *')).toHaveValue('São Paulo');
        expect(screen.getByLabelText('UF *')).toHaveValue('SP');
      });
      await user.type(screen.getByLabelText('Número *'), '100');
      await user.click(screen.getByRole('button', { name: /Criar Conta/i }));

      await waitFor(() => expect(toast.success).toHaveBeenCalled());
      expect(navigateMock).not.toHaveBeenCalled();

      expect(timeoutSpy).toHaveBeenCalled();
      const delayedNavigate = timeoutSpy.mock.calls.find(([, ms]) => ms === 2000)?.[0];
      expect(delayedNavigate).toBeTypeOf('function');
      delayedNavigate();
      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('/');
      });

      timeoutSpy.mockRestore();
    });

    it('TC_REG_016: Erro de submit sem message usa fallback padrão', async () => {
      const user = userEvent.setup();
      registerUser.mockRejectedValueOnce({});

      renderWithRouter(<Register />);
      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));

      await user.type(await screen.findByLabelText('CEP *'), '01001000');
      await waitFor(() => {
        expect(screen.getByLabelText('Cidade *')).toHaveValue('São Paulo');
        expect(screen.getByLabelText('UF *')).toHaveValue('SP');
      });
      await user.type(screen.getByLabelText('Número *'), '100');
      await user.click(screen.getByRole('button', { name: /Criar Conta/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao realizar cadastro.');
      });
    });

    it('TC_REG_017: Upload de comprovante exibe nome do arquivo selecionado', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await fillStep0PF(user);
      await user.click(screen.getByRole('button', { name: /Próximo: Endereço/i }));
      await screen.findByLabelText('CEP *');

      const fileInput = document.querySelector('#register-residence-proof-input');
      const file = new File(['dummy'], 'comprovante.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);

      expect(await screen.findByText(/Arquivo selecionado:/i)).toBeInTheDocument();
      expect(screen.getAllByText('comprovante.pdf').length).toBeGreaterThan(0);
    });

    it('TC_REG_018: Link "Fazer login" chama navigate para /login', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      await user.click(screen.getByText('Fazer login'));
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });

    it('TC_REG_019: Toggles de senha/confirmar alternam tipo do input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const password = screen.getByLabelText('Senha *');
      const confirm = screen.getByLabelText('Confirmar Senha *');
      expect(password).toHaveAttribute('type', 'password');
      expect(confirm).toHaveAttribute('type', 'password');

      const visibilityIcons = screen.getAllByTestId('VisibilityIcon');
      const pwdToggle = visibilityIcons[0].closest('button');
      const confirmToggle = visibilityIcons[1].closest('button');
      expect(pwdToggle).toBeTruthy();
      expect(confirmToggle).toBeTruthy();

      await user.click(pwdToggle);
      await waitFor(() => {
        expect(screen.getByLabelText('Senha *')).toHaveAttribute('type', 'text');
      });

      await user.click(confirmToggle);
      await waitFor(() => {
        expect(screen.getByLabelText('Confirmar Senha *')).toHaveAttribute('type', 'text');
      });
    });
  });
});
