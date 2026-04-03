import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

const BRANDS = [
  {
    id: 'visa',
    label: 'VISA',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg',
  },
  {
    id: 'mastercard',
    label: 'MASTERCARD',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/mastercard.svg',
  },
  {
    id: 'elo',
    label: 'ELO',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/elo.svg',
  },
  {
    id: 'amex',
    label: 'AMEX',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/amex.svg',
  },
  {
    id: 'hipercard',
    label: 'HIPERCARD',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/hipercard.svg',
  },
  {
    id: 'hiper',
    label: 'HIPER',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/hiper.svg',
  },
  {
    id: 'cabal',
    label: 'CABAL',
    logo: 'https://logo.clearbit.com/cabal.coop',
  },
  {
    id: 'verdecard',
    label: 'VERDECARD',
    logo: 'https://logo.clearbit.com/verdecard.com.br',
  },
  {
    id: 'unionpay',
    label: 'UNIONPAY',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/unionpay.svg',
  },
  {
    id: 'diners',
    label: 'DINERS',
    logo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/diners.svg',
  },
];

const CardBrandChips = ({ activeBrand = null, visible = true }) => {
  const [failedLogos, setFailedLogos] = useState({});

  const hasActive = useMemo(() => BRANDS.some((brand) => brand.id === activeBrand), [activeBrand]);

  if (!visible) return null;

  return (
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Bandeiras aceitas
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" id="payments-card-brands-strip">
        {BRANDS.map((brand) => {
          const isActive = activeBrand === brand.id;
          const showFallbackText = Boolean(failedLogos[brand.id]);

          return (
            <Box
              key={brand.id}
              id={`payments-card-brand-${brand.id}`}
              data-brand={brand.id}
              data-active={isActive ? 'true' : 'false'}
              title={brand.label}
              aria-label={brand.label}
              sx={{
                height: 40,
                minWidth: 68,
                px: 1,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: isActive ? 'secondary.main' : 'divider',
                bgcolor: isActive ? 'secondary.50' : 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .2s ease',
                boxShadow: isActive ? '0 0 0 2px rgba(146, 71, 255, 0.12)' : 'none',
                opacity: hasActive && !isActive ? 0.65 : 1,
              }}
            >
              {showFallbackText ? (
                <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
                  {brand.label}
                </Typography>
              ) : (
                <Box
                  component="img"
                  src={brand.logo}
                  alt={`Bandeira ${brand.label}`}
                  loading="lazy"
                  onError={() => setFailedLogos((prev) => ({ ...prev, [brand.id]: true }))}
                  sx={{
                    maxWidth: 52,
                    maxHeight: 24,
                    objectFit: 'contain',
                    filter: hasActive && !isActive ? 'grayscale(25%)' : 'none',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default CardBrandChips;
