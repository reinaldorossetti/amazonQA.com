import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const cards = [
  {
    id: 'admin-products',
    title: 'Gerenciar produtos',
    subtitle: 'Excluir produtos da base de dados',
    to: '/minha-conta/admin/produtos',
  },
  {
    id: 'admin-users',
    title: 'Gerenciar usuários',
    subtitle: 'Excluir usuários da base de dados',
    to: '/minha-conta/admin/usuarios',
  },
];

const AdminHomePage = () => {
  return (
    <Box id="admin-home-wrapper">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Área administrativa
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
            id={`admin-home-card-${card.id}`}
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

export default AdminHomePage;
