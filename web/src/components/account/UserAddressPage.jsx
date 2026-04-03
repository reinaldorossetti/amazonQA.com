import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { getMe, updateMyAddress } from '../../db/api';

const initialAddress = {
  address_zip: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
};

const UserAddressPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialAddress);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const me = await getMe();
        if (!mounted) return;

        setForm({
          address_zip: me?.address_zip || '',
          address_street: me?.address_street || '',
          address_number: me?.address_number || '',
          address_complement: me?.address_complement || '',
          address_neighborhood: me?.address_neighborhood || '',
          address_city: me?.address_city || '',
          address_state: me?.address_state || '',
        });
      } catch (err) {
        if (mounted) setError(err.message || 'Erro ao carregar endereço');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateMyAddress(form);
      toast.success('Endereço atualizado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar endereço');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box id="account-address-loading" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box id="account-address-wrapper" component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Meu endereço
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(12, 1fr)' },
          gap: 2,
        }}
      >
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 4' } }}>
          <TextField id="account-address-zip" label="CEP" fullWidth value={form.address_zip} onChange={handleChange('address_zip')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 8' } }}>
          <TextField id="account-address-street" label="Rua" fullWidth value={form.address_street} onChange={handleChange('address_street')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 4' } }}>
          <TextField id="account-address-number" label="Número" fullWidth value={form.address_number} onChange={handleChange('address_number')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 8' } }}>
          <TextField id="account-address-complement" label="Complemento" fullWidth value={form.address_complement} onChange={handleChange('address_complement')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 6' } }}>
          <TextField id="account-address-neighborhood" label="Bairro" fullWidth value={form.address_neighborhood} onChange={handleChange('address_neighborhood')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 4' } }}>
          <TextField id="account-address-city" label="Cidade" fullWidth value={form.address_city} onChange={handleChange('address_city')} />
        </Box>
        <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
          <TextField id="account-address-state" label="UF" fullWidth value={form.address_state} onChange={handleChange('address_state')} />
        </Box>
      </Box>

      <Button
        id="account-address-save-btn"
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={saving}
      >
        {saving ? 'Salvando...' : 'Salvar endereço'}
      </Button>
    </Box>
  );
};

export default UserAddressPage;
