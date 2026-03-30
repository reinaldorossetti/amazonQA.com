import React from 'react';
import { Box, Paper, Stack, Typography, Button } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/minha-conta', label: 'Resumo da conta' },
  { to: '/minha-conta/dados', label: 'Meu perfil' },
  { to: '/minha-conta/endereco', label: 'Meu endereço' },
  { to: '/minha-conta/pedidos', label: 'Meus pedidos' },
  { to: '/cart', label: 'Carrinho' },
  { to: '/', label: 'Continuar comprando' },
];

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box id="account-layout-wrapper" sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <Typography id="account-layout-title" variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Minha conta
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Paper id="account-layout-menu" sx={{ p: 2, borderRadius: 2, border: '1px solid #d5d9d9' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Olá, {user?.name || 'cliente'}
          </Typography>

          <Stack spacing={1}>
            {links.map((item) => (
              <Button
                key={item.to}
                id={`account-menu-${item.to.replaceAll('/', '-').replace(/^-+/, '')}`}
                component={NavLink}
                to={item.to}
                variant="text"
                sx={{ justifyContent: 'flex-start', color: '#0f1111' }}
              >
                {item.label}
              </Button>
            ))}

            <Button
              id="account-menu-logout"
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{ justifyContent: 'flex-start' }}
            >
              Sair
            </Button>
          </Stack>
        </Paper>

        <Paper id="account-layout-content" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid #d5d9d9' }}>
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
};

export default AccountLayout;
