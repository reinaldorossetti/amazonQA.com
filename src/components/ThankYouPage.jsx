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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useLanguage } from "../contexts/LanguageContext";

const ThankYouPage = ({ clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  // Extrair cartItems do estado do roteador
  const items = location.state?.cartItems ?? [];

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Limpa o carrinho quando a página é montada
  useEffect(() => {
    return () => clearCart();
  }, [clearCart]);

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
