import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import { toast } from 'react-toastify';
import { createProduct, deleteProductByIdAdmin, getProducts, updateProduct } from '../../db/api';

const EMPTY_FORM = {
  name: '',
  price: '',
  description: '',
  category: '',
  image: '',
  manufacturer: '',
  line: '',
  model: '',
  shipping_cost: '',
};

const CATEGORIES = ['Eletrônicos', 'Acessórios', 'Esportes', 'Games', 'Livros', 'Mais Vendidos'];

function ProductFormDialog({ open, product, onClose, onSaved }) {
  const isEditing = Boolean(product?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name ?? '',
              price: product.price ?? '',
              description: product.description ?? '',
              category: product.category ?? '',
              image: product.image ?? '',
              manufacturer: product.manufacturer ?? '',
              line: product.line ?? '',
              model: product.model ?? '',
              shipping_cost: product.shipping_cost ?? '',
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, product]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = 'Preço deve ser um valor positivo.';
    if (form.shipping_cost !== '' && (isNaN(Number(form.shipping_cost)) || Number(form.shipping_cost) < 0))
      errs.shipping_cost = 'Frete deve ser 0 ou positivo.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        image: form.image.trim() || null,
        manufacturer: form.manufacturer.trim() || null,
        line: form.line.trim() || null,
        model: form.model.trim() || null,
        shipping_cost: form.shipping_cost !== '' ? Number(form.shipping_cost) : 0,
      };

      const saved = isEditing
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      toast.success(isEditing ? `Produto "${saved.name}" atualizado!` : `Produto "${saved.name}" criado!`);
      onSaved(saved, isEditing);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      id="support-product-dialog"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '24px', 
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden' 
        } 
      }}
    >
      <DialogTitle
        id="support-product-dialog-title"
        sx={{
          background: '#fff',
          color: '#0F1111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 4,
          px: 4,
          pb: 1
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box 
            sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 153, 0, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}
          >
            <InventoryIcon sx={{ color: '#ff9900' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            {isEditing ? `Editar Produto` : 'Novo Produto'}
          </Typography>
        </Stack>
        <IconButton 
            id="support-product-dialog-close" 
            onClick={onClose} 
            sx={{ 
                color: '#0F1111', 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#eeeeee' }
            }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Nome do Produto</Typography>
            <TextField
              id="support-product-name"
              placeholder="Digite o nome completo"
              fullWidth
              variant="outlined"
              size="medium"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
          {/* Category */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Categoria</Typography>
            <TextField
              id="support-product-category"
              placeholder="Ex: Eletrônicos"
              fullWidth
              size="medium"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              FormHelperTextProps={{ sx: { fontSize: '0.7rem' } }}
            />
          </Grid>
          {/* Price */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Preço</Typography>
            <TextField
              id="support-product-price"
              fullWidth
              size="medium"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                sx: { borderRadius: '12px' }
              }}
            />
          </Grid>
          {/* Shipping cost */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Custo do Frete</Typography>
            <TextField
              id="support-product-shipping"
              fullWidth
              size="medium"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.shipping_cost}
              onChange={(e) => set('shipping_cost', e.target.value)}
              error={!!errors.shipping_cost}
              helperText={errors.shipping_cost || '0 = grátis'}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                sx: { borderRadius: '12px' }
              }}
            />
          </Grid>
          {/* Manufacturer */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Fabricante</Typography>
            <TextField
              id="support-product-manufacturer"
              placeholder="Marca ou Empresa"
              fullWidth
              size="medium"
              value={form.manufacturer}
              onChange={(e) => set('manufacturer', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>Descrição</Typography>
            <TextField
              id="support-product-description"
              placeholder="Descreva as características do produto..."
              fullWidth
              size="medium"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          {/* Image URL with Preview in same row if possible */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#0F1111' }}>URL da Imagem</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                id="support-product-image"
                placeholder="https://..."
                fullWidth
                size="medium"
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                {form.image && (
                <Box
                    component="img"
                    src={form.image}
                    alt="preview"
                    sx={{
                    width: 56,
                    height: 56,
                    objectFit: 'contain',
                    border: '1px solid #d5d9d9',
                    borderRadius: '12px',
                    p: 0.5,
                    backgroundColor: '#fff',
                    flexShrink: 0
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'flex-end', gap: 2 }}>
        <Button 
            id="support-product-cancel-btn" 
            onClick={onClose} 
            variant="text" 
            sx={{ color: '#565959', fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
        >
          Cancelar
        </Button>
        <Button
          id="support-product-save-btn"
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{ 
            backgroundColor: '#FFD814', 
            color: '#0F1111', 
            px: 4,
            py: 1.5,
            borderRadius: '14px',
            fontWeight: 800, 
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(255, 216, 20, 0.4)',
            '&:hover': { backgroundColor: '#F7CA00', boxShadow: '0 6px 20px rgba(255, 216, 20, 0.6)' } 
          }}
          startIcon={saving ? <CircularProgress size={20} sx={{ color: '#0F1111' }} /> : null}
        >
          {saving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const SupportProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [...products].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return products
      .filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q)
      )
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [products, search]);

  const openCreate = () => { setSelectedProduct(null); setDialogOpen(true); };
  const openEdit = (product) => { setSelectedProduct(product); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleSaved = (saved, isEditing) => {
    setProducts((prev) =>
      isEditing
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved]
    );
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Excluir o produto "${product.name}"?\nEsta ação é permanente e não poderá ser desfeita.`)) return;
    try {
      setDeletingId(product.id);
      await deleteProductByIdAdmin(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(`Produto "${product.name}" removido com sucesso.`);
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir produto.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box id="support-products-wrapper">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Box>
          <Typography id="support-products-title" variant="h6" fontWeight={700}>
            Gestão de Produtos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre, edite e remova produtos do catálogo.
          </Typography>
        </Box>
        <Button
          id="support-products-new-btn"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ backgroundColor: '#FFD814', color: '#0F1111', fontWeight: 700, '&:hover': { backgroundColor: '#F7CA00' } }}
        >
          Novo produto
        </Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Search */}
      <TextField
        id="support-products-search"
        placeholder="Pesquisar por nome, categoria ou fabricante..."
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box id="support-products-loading" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box id="support-products-empty" sx={{ textAlign: 'center', py: 6 }}>
          <InventoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography color="text.secondary">
            {search ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto cadastrado ainda.'}
          </Typography>
          {!search && (
            <Button
              id="support-products-empty-new-btn"
              onClick={openCreate}
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Cadastrar primeiro produto
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, color: '#0F1111' }}>
            <Table id="support-products-table" size="small" sx={{ '& td, & th': { color: '#0F1111' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f3f3' }}>
                  <TableCell sx={{ fontWeight: 700, width: 50 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Produto</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Categoria</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Preço</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }} align="right">Frete</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow
                    key={product.id}
                    id={`support-products-row-${product.id}`}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">#{product.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {product.image && (
                          <Box
                            component="img"
                            src={product.image}
                            alt={product.name}
                            sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee', flexShrink: 0 }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }} color="text.primary">
                            {product.name}
                          </Typography>
                          {product.manufacturer && (
                            <Typography variant="caption" color="text.secondary">{product.manufacturer}</Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {product.category && (
                        <Chip label={product.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        R$ {Number(product.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {Number(product.shipping_cost) === 0 ? (
                        <Chip label="Grátis" size="small" color="success" sx={{ fontSize: '0.65rem' }} />
                      ) : (
                        <Typography variant="body2" color="text.primary">R$ {Number(product.shipping_cost).toFixed(2)}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Editar produto">
                          <IconButton
                            id={`support-products-edit-${product.id}`}
                            size="small"
                            onClick={() => openEdit(product)}
                            sx={{ color: '#131921' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir produto">
                          <span>
                            <IconButton
                              id={`support-products-delete-${product.id}`}
                              size="small"
                              color="error"
                              disabled={deletingId === product.id}
                              onClick={() => handleDelete(product)}
                            >
                              {deletingId === product.id
                                ? <CircularProgress size={16} />
                                : <DeleteIcon fontSize="small" />
                              }
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <ProductFormDialog
        open={dialogOpen}
        product={selectedProduct}
        onClose={closeDialog}
        onSaved={handleSaved}
      />
    </Box>
  );
};

export default SupportProductsPage;
