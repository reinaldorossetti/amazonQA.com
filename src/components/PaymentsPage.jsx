import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrderPayment } from '../db/api';
import CardBrandChips from './payment/CardBrandChips';
import PaymentMethodSelector from './payment/PaymentMethodSelector';

const METHOD_OPTIONS = ['credit', 'debit', 'pix', 'boleto'];

function detectCardBrand(cardNumber = '') {
  const n = String(cardNumber).replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(636297|636368|438935|504175|451416|506699|6362|5066|5090|6500|6516|6550)/.test(n)) return 'elo';
  if (/^637601/.test(n)) return 'cabal';
  if (/^5899/.test(n)) return 'verdecard';
  if (/^637095/.test(n)) return 'hiper';
  if (/^(6062|3841|637568)/.test(n)) return 'hipercard';
  if (/^62/.test(n)) return 'unionpay';
  if (/^(30[0-5]|36|38|39)/.test(n)) return 'diners';
  return null;
}

function formatCardNumber(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const defaultCardData = {
  holderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  installments: 1,
};

const PaymentsPage = ({ clearCart = () => {} }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;
  const cartItems = Array.isArray(location.state?.cartItems) ? location.state.cartItems : [];

  const total = Number(order?.grand_total ?? 0);

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('credit');
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [secondMethod, setSecondMethod] = useState('pix');
  const [firstAmount, setFirstAmount] = useState(total > 0 ? Number((total / 2).toFixed(2)) : 0);
  const [cardData, setCardData] = useState(defaultCardData);

  const activeBrand = useMemo(
    () => detectCardBrand(cardData.cardNumber),
    [cardData.cardNumber]
  );

  const remaining = useMemo(() => {
    const value = Number(total) - Number(firstAmount || 0);
    return Number(value.toFixed(2));
  }, [firstAmount, total]);

  const ctaLabel = useMemo(() => {
    if (method === 'pix') return t('payments.cta.generate_pix');
    if (method === 'boleto') return t('payments.cta.generate_boleto');
    return t('payments.cta.pay_now');
  }, [method, t]);

  const handleCardChange = (field) => (event) => {
    let nextValue = event.target.value;

    if (field === 'cardNumber') {
      nextValue = formatCardNumber(nextValue);
    }

    if (field === 'expiry') {
      nextValue = formatExpiry(nextValue);
    }

    if (field === 'cvv') {
      nextValue = String(nextValue).replace(/\D/g, '').slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [field]: nextValue }));
  };

  const buildPaymentPayload = (methodValue, amountValue) => {
    const payload = {
      method: methodValue,
      amount: amountValue,
    };

    if (methodValue === 'credit' || methodValue === 'debit') {
      payload.holderName = cardData.holderName;
      payload.cardNumber = cardData.cardNumber;
      payload.expiry = cardData.expiry;
      payload.cvv = cardData.cvv;
      payload.installments = Number(cardData.installments || 1);
      payload.cardBrand = activeBrand;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!order?.id) {
      toast.error(t('payments.error.no_order'));
      navigate('/cart');
      return;
    }

    if (splitEnabled) {
      if (!firstAmount || firstAmount <= 0 || remaining <= 0) {
        toast.error(t('payments.error.invalid_split'));
        return;
      }
      if (method === secondMethod) {
        toast.error(t('payments.error.same_method'));
        return;
      }
    }

    try {
      setLoading(true);

      const payments = [];
      const firstPayment = await createOrderPayment(order.id, buildPaymentPayload(method, splitEnabled ? firstAmount : total));
      payments.push(firstPayment);

      if (firstPayment.status === 'failed') {
        toast.error('Pagamento negado. Tente outro método.');
        return;
      }

      if (splitEnabled) {
        const secondPayment = await createOrderPayment(order.id, buildPaymentPayload(secondMethod, remaining));
        payments.push(secondPayment);

        if (secondPayment.status === 'failed') {
          toast.error('Segundo pagamento negado. Ajuste os métodos e tente novamente.');
          return;
        }
      }

      const hasPending = payments.some((p) => p.status === 'pending');
      if (hasPending) {
        toast.info(t('payments.pending'));
      } else {
        toast.success(t('payments.success'));
      }

      clearCart();
      navigate('/thank-you', {
        state: {
          cartItems,
          order: {
            ...order,
            paymentStatus: hasPending ? 'pending' : 'authorized',
            payments,
          },
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Falha ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (!order?.id) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          {t('payments.error.no_order')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('payments.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('payments.subtitle')}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>{t('payments.method')}</Typography>
          <PaymentMethodSelector value={method} onChange={setMethod} />

          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Checkbox checked={splitEnabled} onChange={(e) => setSplitEnabled(e.target.checked)} />}
            label={t('payments.split.enable')}
          />

          {splitEnabled && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('payments.split.second_method')}</InputLabel>
                <Select
                  value={secondMethod}
                  label={t('payments.split.second_method')}
                  onChange={(e) => setSecondMethod(e.target.value)}
                >
                  {METHOD_OPTIONS.filter((m) => m !== method).map((m) => (
                    <MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={t('payments.split.first_amount')}
                type="number"
                size="small"
                value={firstAmount}
                onChange={(e) => setFirstAmount(Number(e.target.value))}
                inputProps={{ min: '0.01', step: '0.01', max: total }}
              />
              <Typography variant="body2" color="text.secondary">
                {t('payments.split.remaining')}: <strong>R$ {remaining.toFixed(2)}</strong>
              </Typography>
            </Stack>
          )}

          {(method === 'credit' || method === 'debit') && (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <TextField
                id="payments-card-holder-input"
                label={t('payments.card.holder')}
                size="small"
                value={cardData.holderName}
                onChange={handleCardChange('holderName')}
                inputProps={{ autoComplete: 'cc-name' }}
              />
              <TextField
                id="payments-card-number-input"
                label={t('payments.card.number')}
                size="small"
                value={cardData.cardNumber}
                onChange={handleCardChange('cardNumber')}
                inputProps={{ inputMode: 'numeric', autoComplete: 'cc-number' }}
                helperText={cardData.cardNumber ? 'A bandeira é detectada automaticamente.' : 'Digite os números do cartão para identificar a bandeira.'}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  id="payments-card-expiry-input"
                  label={t('payments.card.expiry')}
                  size="small"
                  value={cardData.expiry}
                  onChange={handleCardChange('expiry')}
                  inputProps={{ inputMode: 'numeric', autoComplete: 'cc-exp', placeholder: 'MM/AA' }}
                />
                <TextField
                  id="payments-card-cvv-input"
                  label={t('payments.card.cvv')}
                  size="small"
                  value={cardData.cvv}
                  onChange={handleCardChange('cvv')}
                  inputProps={{ inputMode: 'numeric', autoComplete: 'cc-csc' }}
                />
                {method === 'credit' && (
                  <TextField
                    id="payments-card-installments-input"
                    label={t('payments.card.installments')}
                    type="number"
                    size="small"
                    inputProps={{ min: 1, max: 12 }}
                    value={cardData.installments}
                    onChange={handleCardChange('installments')}
                  />
                )}
              </Stack>
              <CardBrandChips
                activeBrand={activeBrand}
                visible={Boolean(String(cardData.cardNumber).replace(/\D/g, '').length)}
              />
            </Stack>
          )}

          {method === 'pix' && (
            <Alert severity="info" sx={{ mt: 2 }}>{t('payments.pix.info')}</Alert>
          )}

          {method === 'boleto' && (
            <Alert severity="info" sx={{ mt: 2 }}>{t('payments.boleto.info')}</Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processando...' : ctaLabel}
          </Button>
        </Paper>

        <Paper sx={{ width: { xs: '100%', md: 320 }, p: 3, borderRadius: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LockIcon fontSize="small" color="success" />
            <Typography fontWeight={700}>{t('payments.secure')}</Typography>
          </Stack>

          <Typography variant="h6" sx={{ mb: 1 }}>{t('payments.summary')}</Typography>
          <Stack spacing={0.75}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Pedido</Typography>
              <Typography>#{order.id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">{t('payments.amount')}</Typography>
              <Typography fontWeight={700}>R$ {total.toFixed(2)}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default PaymentsPage;
