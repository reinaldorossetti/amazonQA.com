import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const cards = [
  { id: 'orders', title: 'Meus pedidos', subtitle: 'Acompanhe compras e status', to: '/minha-conta/pedidos' },
  { id: 'profile', title: 'Meu perfil', subtitle: 'Veja seus dados pessoais', to: '/minha-conta/dados' },
  { id: 'address', title: 'Meu endereço', subtitle: 'Consulte e edite endereço', to: '/minha-conta/endereco' },
  { id: 'cart', title: 'Carrinho', subtitle: 'Revise itens antes de comprar', to: '/cart' },
];

const AccountHome = () => {
  return (
    <Box id="account-home-wrapper">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Bem-vindo à sua área logada
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(220px, 1fr))' },
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            id={`account-home-card-${card.id}`}
            component={Link}
            to={card.to}
            sx={{ textDecoration: 'none', border: '1px solid #d5d9d9', boxShadow: 'none' }}
          >
            <CardContent>
              <Typography sx={{ fontWeight: 700, color: '#0f1111' }}>{card.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AccountHome;
