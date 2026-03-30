import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Divider, Typography } from '@mui/material';
import { getMe } from '../../db/api';

const UserProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getMe();
        if (mounted) setProfile(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Erro ao carregar dados do usuário');
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
      <Box id="account-profile-loading" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box id="account-profile-wrapper">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Meu perfil
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography id="account-profile-name" sx={{ mb: 1 }}>
        <strong>Nome:</strong> {profile?.first_name} {profile?.last_name}
      </Typography>
      <Typography id="account-profile-email" sx={{ mb: 1 }}>
        <strong>E-mail:</strong> {profile?.email}
      </Typography>
      <Typography id="account-profile-person-type" sx={{ mb: 1 }}>
        <strong>Tipo:</strong> {profile?.person_type || '-'}
      </Typography>
      <Typography id="account-profile-phone" sx={{ mb: 1 }}>
        <strong>Telefone:</strong> {profile?.phone || '-'}
      </Typography>
    </Box>
  );
};

export default UserProfilePage;
