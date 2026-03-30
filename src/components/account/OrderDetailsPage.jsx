import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getMyOrderById } from '../../db/api';

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getMyOrderById(id);
        if (mounted) setOrder(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Erro ao carregar detalhes do pedido');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box id="account-order-details-loading" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!order) {
    return <Alert severity="warning">Pedido não encontrado.</Alert>;
  }

  return (
    <Box id="account-order-details-wrapper">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Pedido {order.order_number || `#${order.id}`}
      </Typography>
      <Typography sx={{ mb: 0.5 }}><strong>Status:</strong> {order.status}</Typography>
      <Typography sx={{ mb: 2 }}><strong>Total:</strong> {formatCurrency(order.grand_total)}</Typography>

      <Divider sx={{ mb: 1 }} />
      <Typography sx={{ fontWeight: 700, mb: 1 }}>Itens</Typography>

      <List dense id="account-order-details-items">
        {(order.items || []).map((item) => (
          <ListItem key={item.id || `${item.product_id}-${item.quantity}`}>
            <ListItemText
              primary={item.product_name_snapshot || `Produto #${item.product_id}`}
              secondary={`Qtd: ${item.quantity} • Total: ${formatCurrency(item.line_total)}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default OrderDetailsPage;
