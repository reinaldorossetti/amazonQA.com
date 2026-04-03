import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { deleteUserByIdAdmin, getUsersAdmin } from '../../db/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.id - b.id), [users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const firstPage = await getUsersAdmin({ page: 1, pageSize: 100, status: 'all' });
      const total = Number(firstPage?.total || 0);
      const pageSize = Number(firstPage?.pageSize || 100);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const data = totalPages > 1
        ? await getUsersAdmin({ page: totalPages, pageSize, status: 'all' })
        : firstPage;

      setUsers(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (targetUser) => {
    const isSelf = Number(user?.id) === Number(targetUser.id);
    if (isSelf) {
      toast.warning('Não é permitido excluir o próprio usuário admin.');
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir o usuário \"${targetUser.first_name} ${targetUser.last_name}\"? Esta ação é permanente.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(targetUser.id);
      await deleteUserByIdAdmin(targetUser.id);
      setUsers((prev) => prev.filter((item) => item.id !== targetUser.id));
      toast.success('Usuário excluído com sucesso.');
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir usuário.');
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
    <Box id="admin-users-wrapper">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Administração de Usuários
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Somente administradores podem excluir usuários da base de dados.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={1.5}>
        {sortedUsers.map((item) => {
          const isSelf = Number(user?.id) === Number(item.id);
          return (
            <Box
              key={item.id}
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
                <Typography sx={{ fontWeight: 700 }}>
                  {item.first_name} {item.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {item.id} • {item.email}
                </Typography>
              </Box>

              <Button
                id={`admin-users-delete-${item.id}`}
                color="error"
                variant="outlined"
                disabled={deletingId === item.id || isSelf}
                onClick={() => handleDelete(item)}
              >
                {isSelf ? 'Usuário atual' : deletingId === item.id ? 'Excluindo...' : 'Excluir usuário'}
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default AdminUsersPage;
