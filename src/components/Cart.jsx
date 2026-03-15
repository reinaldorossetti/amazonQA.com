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

const Cart = ({ cartItems, onUpdateCart, onRemoveFromCart, setCartItems }) => {
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Meu Carrinho
      </Typography>

      {cartItems.length === 0 ? (
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
            Seu carrinho está vazio
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Adicione produtos do catálogo para começar.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<ArrowBackIcon />}
          >
            Ir ao Catálogo
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Lista de itens */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <List disablePadding>
                {cartItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <CartItem
                      item={item}
                      onUpdateCart={onUpdateCart}
                      onRemoveFromCart={onRemoveFromCart}
                    />
                    {index < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Resumo do pedido */}
          <Box sx={{ width: { xs: "100%", md: 300 } }}>
            <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Resumo do Pedido
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    Itens ({totalItems})
                  </Typography>
                  <Typography>R$ {totalPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Frete</Typography>
                  <Typography color="success.main" fontWeight={600}>
                    Grátis
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  R$ {totalPrice.toFixed(2)}
                </Typography>
              </Box>

              <CheckoutButton
                cartItems={cartItems}
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
                Continuar comprando
              </Button>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart;
