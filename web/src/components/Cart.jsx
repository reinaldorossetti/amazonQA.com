import React from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  Divider,
  Box,
  Button,
  Stack,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import CheckoutButton from "./CheckoutButton";
import { useLanguage } from "../contexts/LanguageContext";

const Cart = ({
  cartItems = [],
  onUpdateCart = () => {},
  onRemoveFromCart = () => {},
  setCartItems = () => {},
}) => {
  const { t } = useLanguage();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const totalPrice = safeCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = safeCartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        {t("cart.title")}
      </Typography>

      {safeCartItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            borderRadius: 3,
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("cart.empty_title")}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {t("cart.empty_desc")}
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<ArrowBackIcon />}
          >
            {t("cart.go_to_catalog")}
          </Button>
        </Paper>
      ) : (
        <Box id="cart-content-wrapper" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Lista de itens */}
          <Box id="cart-item-list-wrapper" sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <List disablePadding>
                {safeCartItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <CartItem
                      item={item}
                      onUpdateCart={onUpdateCart}
                      onRemoveFromCart={onRemoveFromCart}
                    />
                    {index < safeCartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Resumo do pedido */}
          <Box id="cart-order-summary-wrapper" sx={{ width: { xs: "100%", md: 300 } }}>
            <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {t("cart.order_summary")}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box id="cart-order-items-count" sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    {t("cart.items", { count: totalItems })}
                  </Typography>
                  <Typography>R$ {totalPrice.toFixed(2)}</Typography>
                </Box>
                <Box id="cart-order-shipping" sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">{t("cart.shipping")}</Typography>
                  <Typography color="success.main" fontWeight={600}>
                    {t("cart.free")}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box id="cart-order-total"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {t("cart.total")}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  R$ {totalPrice.toFixed(2)}
                </Typography>
              </Box>

              <CheckoutButton
                cartItems={safeCartItems}
                setCartItems={setCartItems}
              />

              <Button
                component={Link}
                to="/"
                fullWidth
                variant="text"
                startIcon={<ArrowBackIcon />}
                sx={{ mt: 1 }}
              >
                {t("cart.continue_shopping")}
              </Button>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart;
