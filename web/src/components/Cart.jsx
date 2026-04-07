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
    <Container maxWidth="xl" sx={{ mt: 3, mb: 8, px: { xs: 2, md: 4 } }}>
      {safeCartItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            borderRadius: 0,
            border: "1px solid #D5D9D9",
            backgroundColor: "#fff"
          }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" color="text.primary" gutterBottom fontWeight={700}>
            Your Amazon Cart is empty.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
          >
            {t("cart.go_to_catalog")}
          </Button>
        </Paper>
      ) : (
        <Box id="cart-content-wrapper" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Lista de itens (75%) */}
          <Box id="cart-item-list-wrapper" sx={{ flexGrow: 1, width: { xs: "100%", md: "75%" } }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: "1px solid #D5D9D9", backgroundColor: "#fff" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
                <Typography variant="h4" component="h1" fontWeight={400} sx={{ fontSize: "28px" }}>
                  Shopping Cart
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: "#D5D9D9" }} />

              <List disablePadding>
                {safeCartItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <CartItem
                      item={item}
                      onUpdateCart={onUpdateCart}
                      onRemoveFromCart={onRemoveFromCart}
                    />
                    {index < safeCartItems.length - 1 && <Divider sx={{ my: 2, borderColor: "#D5D9D9" }} />}
                  </React.Fragment>
                ))}
              </List>
              <Divider sx={{ mt: 2, mb: 2, borderColor: "#D5D9D9" }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography variant="h6" fontWeight={400} sx={{ fontSize: "18px" }}>
                   Subtotal ({totalItems} items): <Box component="span" fontWeight={700}>R$ {totalPrice.toFixed(2)}</Box>
                </Typography>
              </Box>
            </Paper>

             {/* Recommended based on recent items section */}
             <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: 0, border: "1px solid #D5D9D9", backgroundColor: "#fff" }}>
               <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                 Recommended based on recent items
               </Typography>
               <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
                 {/* Fake recommended items just to mimic design */}
                 <Box sx={{ minWidth: 150 }}>
                   <Box sx={{ width: 100, height: 100, backgroundColor: "#f5f5f5", mb: 1, mx: "auto" }} />
                   <Typography variant="body2" color="primary" sx={{ cursor: "pointer", "&:hover": { color: "#c45500", textDecoration: "underline" } }}>Placeholder Item</Typography>
                   <Typography variant="body2" fontWeight={700} color="error">$99.00</Typography>
                   <Button variant="contained" size="small" sx={{ backgroundColor: "#FFD814", color: "#111", mt: 1, borderRadius: 8, "&:hover": { backgroundColor: "#F7CA00" } }}>Add to Cart</Button>
                 </Box>
               </Box>
             </Paper>

          </Box>

          {/* Resumo do pedido (25%) */}
          <Box id="cart-order-summary-wrapper" sx={{ width: { xs: "100%", md: "25%" }, minWidth: "300px" }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: "none", backgroundColor: "#fff" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="body2" color="success.main" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Your order qualifies for FREE Shipping.
                </Typography>
              </Box>

              <Typography variant="h6" fontWeight={400} sx={{ fontSize: "18px", mb: 2 }}>
                Subtotal ({totalItems} items): <Box component="span" fontWeight={700}>R$ {totalPrice.toFixed(2)}</Box>
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button
                  component={Link}
                  to="/payments"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    backgroundColor: "#FFD814", 
                    color: "#0F1111", 
                    borderRadius: 8, 
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
                    "&:hover": { backgroundColor: "#F7CA00" } 
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart;
