import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../db/api';

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const OrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders({ page: 1, pageSize: 20 });
        if (mounted) {
          setOrders(Array.isArray(data?.items) ? data.items : []);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Erro ao carregar pedidos');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box id="account-orders-loading" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box id="account-orders-wrapper">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Meus pedidos
      </Typography>

      {orders.length === 0 ? (
        <Alert severity="info">Você ainda não possui pedidos.</Alert>
      ) : (
        <List id="account-orders-list" sx={{ p: 0 }}>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <ListItemButton
                id={`account-order-item-${order.id}`}
                component={Link}
                to={`/minha-conta/pedidos/${order.id}`}
              >
                <ListItemText
                  primary={`Pedido ${order.order_number || `#${order.id}`}`}
                  secondary={`Status: ${order.status} • Total: ${formatCurrency(order.grand_total)}`}
                />
              </ListItemButton>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrdersPage;
