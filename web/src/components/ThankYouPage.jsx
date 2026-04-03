import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useLanguage } from "../contexts/LanguageContext";

const ThankYouPage = ({ clearCart = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  // Extrair cartItems do estado do roteador
  const items = location.state?.cartItems ?? [];
  const order = location.state?.order ?? null;
  const payments = Array.isArray(order?.payments) ? order.payments : [];
  const pixPayment = payments.find((p) => p?.method === "pix");
  const pix = pixPayment?.metadata ?? null;
  const boletoPayment = payments.find((p) => p?.method === "boleto");
  const boleto = boletoPayment?.metadata ?? null;

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Limpa o carrinho quando a página é montada
  useEffect(() => {
    return () => clearCart();
  }, [clearCart]);

  const handleCopyBoletoLine = async () => {
    const line = boleto?.line;
    if (!line) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(line);
      }
    } catch {
      // no-op para ambiente sem clipboard
    }
  };

  const handleCopyPixCode = async () => {
    const code = pix?.pixCode;
    if (!code) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
    } catch {
      // no-op para ambiente sem clipboard
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 6 },
          mt: 4,
          borderRadius: 4,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 100, mb: 2 }} />

        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t("thank_you.title")}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          {t("thank_you.subtitle")}
        </Typography>

        {pix && (
          <Paper variant="outlined" sx={{ width: "100%", p: 2, mb: 3, textAlign: "left" }}>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                {t("thank_you.pix.title")}
              </Typography>
              <Alert severity="info">{t("thank_you.pix.mock_notice")}</Alert>
              {pix.qrCodeImage && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                  <Box component="img" src={pix.qrCodeImage} alt="PIX QR Code Mock" sx={{ width: 240, height: 240, border: "1px solid #ddd", borderRadius: 1, p: 1, backgroundColor: "#fff" }} />
                </Box>
              )}
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                <strong>{t("thank_you.pix.code")}:</strong> {pix.pixCode}
              </Typography>
              <Typography variant="body2">
                <strong>{t("thank_you.pix.readable_text")}:</strong> {pix.readableText || "Valor ao ler QR Code: R$ 0,00"}
              </Typography>
              <Typography variant="body2">
                <strong>{t("thank_you.pix.expires")}:</strong> {String(pix.expiresAt || "").slice(0, 19).replace("T", " ")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" onClick={handleCopyPixCode}>
                  {t("thank_you.pix.copy")}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {boleto && (
          <Paper variant="outlined" sx={{ width: "100%", p: 2, mb: 3, textAlign: "left" }}>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                {t("thank_you.boleto.title")}
              </Typography>
              <Alert severity="info">{t("thank_you.boleto.mock_notice")}</Alert>
              <Typography variant="body2">
                <strong>{t("thank_you.boleto.beneficiary")}:</strong> {boleto.beneficiaryName}
              </Typography>
              <Typography variant="body2">
                <strong>{t("thank_you.boleto.cnpj")}:</strong> {boleto.beneficiaryDocument}
              </Typography>
              <Typography variant="body2">
                <strong>{t("thank_you.boleto.due_date")}:</strong> {String(boleto.dueDate || "").slice(0, 10)}
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                <strong>{t("thank_you.boleto.line")}:</strong> {boleto.line}
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                <strong>{t("thank_you.boleto.barcode")}:</strong> {boleto.barcode}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" onClick={handleCopyBoletoLine}>
                  {t("thank_you.boleto.copy")}
                </Button>
                {boleto.downloadUrl && (
                  <Button component="a" href={boleto.downloadUrl} target="_blank" rel="noreferrer" variant="contained" color="secondary">
                    {t("thank_you.boleto.download")}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}

        {items.length > 0 && (
          <Box id="thank-you-summary-wrapper" sx={{ width: "100%", mb: 4, textAlign: "left" }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t("thank_you.summary")}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table aria-label="tabela de itens do pedido">
                <TableHead sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <TableRow>
                    <TableCell><strong>{t("thank_you.product")}</strong></TableCell>
                    <TableCell align="center"><strong>{t("thank_you.qty")}</strong></TableCell>
                    <TableCell align="right"><strong>{t("thank_you.unit_price")}</strong></TableCell>
                    <TableCell align="right"><strong>{t("thank_you.table_total")}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <strong>R$ {(item.price * item.quantity).toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box id="thank-you-total-wrapper" sx={{ display: "flex", justifyContent: "flex-end", mr: 2 }}>
              <Typography variant="h5" fontWeight={700} color="primary">
                {t("thank_you.total", { total: totalPrice.toFixed(2) })}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ width: "100%", mb: 4 }} />

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<StorefrontIcon />}
          onClick={() => navigate("/")}
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
        >
          {t("thank_you.back")}
        </Button>
      </Paper>
    </Container>
  );
};

export default ThankYouPage;
