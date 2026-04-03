import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { deleteProductByIdAdmin, getProducts } from '../../db/api';

const AdminProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))),
    [products]
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Deseja realmente excluir o produto \"${product.name}\"? Esta ação é permanente.`);
    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      await deleteProductByIdAdmin(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      toast.success('Produto excluído com sucesso.');
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir produto.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box id="admin-products-wrapper">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Administração de Produtos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Somente administradores podem excluir produtos da base de dados.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={1.5}>
        {sortedProducts.map((product) => (
          <Box
            key={product.id}
            sx={{
              border: '1px solid #d5d9d9',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {product.id} • Categoria: {product.category || '-'}
              </Typography>
            </Box>

            <Button
              id={`admin-products-delete-${product.id}`}
              color="error"
              variant="outlined"
              disabled={deletingId === product.id}
              onClick={() => handleDelete(product)}
            >
              {deletingId === product.id ? 'Excluindo...' : 'Excluir produto'}
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminProductsPage;
