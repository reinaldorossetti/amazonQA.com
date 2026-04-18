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
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        id="support-product-dialog-title"
        sx={{
          background: 'linear-gradient(135deg, #131921 0%, #37475A 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <InventoryIcon sx={{ color: '#ff9900' }} />
          <Typography fontWeight={700}>
            {isEditing ? `Editar produto #${product.id}` : 'Novo produto'}
          </Typography>
        </Stack>
        <IconButton id="support-product-dialog-close" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12} sm={8}>
            <TextField
              id="support-product-name"
              label="Nome *"
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          {/* Category */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="support-product-category"
              label="Categoria"
              fullWidth
              size="small"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              helperText={`Sugeridos: ${CATEGORIES.join(', ')}`}
              FormHelperTextProps={{ sx: { fontSize: '0.65rem' } }}
            />
          </Grid>
          {/* Price */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="support-product-price"
              label="Preço (R$) *"
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          {/* Shipping cost */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="support-product-shipping"
              label="Frete (R$)"
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.shipping_cost}
              onChange={(e) => set('shipping_cost', e.target.value)}
              error={!!errors.shipping_cost}
              helperText={errors.shipping_cost || '0 = frete grátis'}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          {/* Manufacturer */}
          <Grid item xs={12} sm={4}>
            <TextField
              id="support-product-manufacturer"
              label="Fabricante"
              fullWidth
              size="small"
              value={form.manufacturer}
              onChange={(e) => set('manufacturer', e.target.value)}
            />
          </Grid>
          {/* Line */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="support-product-line"
              label="Linha"
              fullWidth
              size="small"
              value={form.line}
              onChange={(e) => set('line', e.target.value)}
            />
          </Grid>
          {/* Model */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="support-product-model"
              label="Modelo"
              fullWidth
              size="small"
              value={form.model}
              onChange={(e) => set('model', e.target.value)}
            />
          </Grid>
          {/* Image URL */}
          <Grid item xs={12}>
            <TextField
              id="support-product-image"
              label="URL da Imagem"
              fullWidth
              size="small"
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="https://..."
            />
          </Grid>
          {/* Preview */}
          {form.image && (
            <Grid item xs={12}>
              <Box
                component="img"
                src={form.image}
                alt="preview"
                sx={{
                  height: 80,
                  objectFit: 'contain',
                  border: '1px solid #d5d9d9',
                  borderRadius: 1,
                  p: 0.5,
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Grid>
          )}
          {/* Description */}
          <Grid item xs={12}>
            <TextField
              id="support-product-description"
              label="Descrição"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button id="support-product-cancel-btn" onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          id="support-product-save-btn"
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{ backgroundColor: '#FFD814', color: '#0F1111', fontWeight: 700, '&:hover': { backgroundColor: '#F7CA00' } }}
          startIcon={saving ? <CircularProgress size={16} sx={{ color: '#0F1111' }} /> : null}
        >
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
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
