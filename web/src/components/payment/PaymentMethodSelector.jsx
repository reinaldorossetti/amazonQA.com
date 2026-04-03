import React from 'react';
import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';

const METHODS = [
  { id: 'credit', title: 'Crédito', subtitle: 'Visa, Master, Elo...' },
  { id: 'debit', title: 'Débito', subtitle: 'Débito online' },
  { id: 'pix', title: 'PIX', subtitle: 'Aprovação rápida' },
  { id: 'boleto', title: 'Boleto', subtitle: 'Pagamento em até 3 dias úteis' },
];

const PaymentMethodSelector = ({ value, onChange }) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
      {METHODS.map((method) => {
        const selected = value === method.id;
        return (
          <Card
            key={method.id}
            variant="outlined"
            sx={{
              flex: '1 1 220px',
              borderColor: selected ? 'secondary.main' : 'divider',
              borderWidth: selected ? 2 : 1,
            }}
          >
            <CardActionArea onClick={() => onChange(method.id)}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography fontWeight={700}>{method.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {method.subtitle}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
};

export default PaymentMethodSelector;
