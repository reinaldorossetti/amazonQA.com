import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
  Tooltip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Link } from "react-router-dom";

import Catalog from "./components/Catalog";
import Cart from "./components/Cart";
import ThankYouPage from "./components/ThankYouPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#232f3e", // Amazon Dark Blue (Navbar)
      light: "#37475A",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff9900", // Amazon Orange (Logo, accents)
      light: "#FFB03B",
      dark: "#E47911", // Amazon Action Button color
      contrastText: "#000",
    },
    success: {
      main: "#067D62", // Amazon Green (e.g. In Stock)
    },
    background: {
      default: "#eaeded", // Amazon Light Gray background
      paper: "#ffffff",
    },
    text: {
      primary: "#0F1111", // Amazon deep gray for primary text
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h4: { fontWeight: 700, color: "#0F1111" },
    h5: { fontWeight: 700, color: "#0F1111" },
    h6: { fontWeight: 600, color: "#0F1111" },
    subtitle1: { fontWeight: 600 },
    body1: { color: "#0F1111" },
    body2: { color: "#565959" }, // Amazon light gray text
  },
  shape: {
    borderRadius: 8, // Amazon is slightly more square
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
        },
        containedSecondary: {
          backgroundColor: "#FFD814", // Amazon Yellow Add to Cart button
          color: "#0F1111",
          border: "1px solid #FCD200",
          "&:hover": {
            backgroundColor: "#F7CA00",
            border: "1px solid #F2C200",
          },
        },
        containedPrimary: {
          // Used for "Buy Now" or checkout style buttons
          backgroundColor: "#FFA41C",
          color: "#0F1111",
          border: "1px solid #FF8F00",
          "&:hover": {
            backgroundColor: "#FA8900",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #D5D9D9",
          boxShadow: "none", // Amazon cards are typically bordered, not heavily shadowed initially
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#131921", // Amazon's specific top navbar color
        },
      },
    },
  },
});

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const NavBar = ({ cartCount, search, setSearch }) => {
  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#131921", border: "none", borderRadius: 0 }}>
      {/* Container fluido zero padding lateral para ficar igual Amazon (ponta a ponta) */}
      <Toolbar disableGutters sx={{ minHeight: "60px !important", px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        
        {/* Logo Ouro da Amazon, escrito tester.com */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            px: 1,
            py: 1,
            mt: 0.5,
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { border: "1px solid #fff" },
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "baseline",
              fontSize: "1.5rem",
              lineHeight: 1,
              fontFamily: "Arial, sans-serif",
              color: "#fff"
            }}
          >
            tester<Box component="span" sx={{ color: "#ff9900", fontSize: "1.2rem", ml: "1px" }}>.com</Box>
          </Typography>
        </Box>

        {/* Botão de Catálogo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textDecoration: "none",
            color: "#fff",
            px: 1,
            py: 1,
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { border: "1px solid #fff" },
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "#ccc", lineHeight: 1 }}>Navegue pelo</Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1 }}>Catálogo</Typography>
        </Box>

        {/* Barra de Pesquisa Central Estilo Amazon */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexGrow: 1,
            height: 40,
            borderRadius: "4px", // Amazon search has mildly rounded corners inside
            overflow: "hidden",
            "&:focus-within": {
              boxShadow: "0 0 0 2px #f90, 0 0 0 3px #131921",
            },
            mx: 1
          }}
        >
          <Box
            sx={{
              backgroundColor: "#f3f3f3",
              color: "#555",
              px: 1.5,
              display: "flex",
              alignItems: "center",
              borderRight: "1px solid #cdcdcd",
              fontSize: "0.75rem",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#d4d4d4", color: "#000" },
            }}
          >
            Todos ▾
          </Box>
          <Box
            component="input"
            placeholder="Pesquisa tester.com"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              border: "none",
              outline: "none",
              px: 1.5,
              fontSize: "15px",
              color: "#111",
            }}
          />
          <Box
            sx={{
              backgroundColor: "#febd69",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 45,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f3a847" },
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#333">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </Box>
        </Box>

        {/* Carrinho Estilo Amazon idêntico: número flutuante laranja sob SVG */}
        <Box
          component={Link}
          to="/cart"
          sx={{
            display: "flex",
            alignItems: "flex-end",
            textDecoration: "none",
            color: "#fff",
            px: 1,
            py: 1,
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { border: "1px solid #fff" },
          }}
        >
          <Box sx={{ position: "relative", width: 40, height: 35 }}>
            <Box
              sx={{
                position: "absolute",
                top: -2,
                left: 0,
                width: "100%",
                textAlign: "center",
                color: "#f08804",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "16px",
              }}
            >
              {cartCount}
            </Box>
            <svg
              width="38"
              height="26"
              style={{ position: "absolute", bottom: 0, left: 1 }}
              viewBox="0 0 38 26"
            >
              <path
                d="M13.5 25.5C14.8807 25.5 16 24.3807 16 23C16 21.6193 14.8807 20.5 13.5 20.5C12.1193 20.5 11 21.6193 11 23C11 24.3807 12.1193 25.5 13.5 25.5Z"
                fill="currentColor"
              />
              <path
                d="M28.5 25.5C29.8807 25.5 31 24.3807 31 23C31 21.6193 29.8807 20.5 28.5 20.5C27.1193 20.5 26 21.6193 26 23C26 24.3807 27.1193 25.5 28.5 25.5Z"
                fill="currentColor"
              />
              <path
                d="M32.89 8.21C32.73 8.03 32.5 7.93 32.26 7.93h-22l-1.89-6.38A1.102 1.102 0 0 0 7.31 0.72H1.6C1 0.72 0.5 1.21 0.5 1.83C0.5 2.44 1 2.94 1.6 2.94h4.86l5.77 19.46a3.298 3.298 0 0 0 3.16 2.37h15C31.51 24.78 32.5 23.79 32.5 22.56c0-1.23-0.99-2.22-2.22-2.22l-15.68 0.02-0.89-3h17.93a1.111 1.111 0 0 0 1.09-0.84l2.45-7.79c0.05-0.18 0.03-0.37-0.08-0.52z"
                fill="currentColor"
              />
              <path
                d="M10.27 10.16h21l-1.22 3.88h-18.7l-1.08-3.88h0z"
                fill="#131921"
              />
            </svg>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              display: { xs: "none", md: "block" },
              fontSize: "14px",
              mb: 0.5,
              ml: 0.5,
              color: "#fff"
            }}
          >
            Carrinho
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        toast.info(`Quantidade atualizada: ${product.name}`);
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
      } else {
        toast.success(`${product.name} adicionado ao carrinho!`);
        return [...prevItems, { ...product, quantity: Number(quantity) }];
      }
    });
  };

  const handleUpdateCart = (product, quantity) => {
    setCartItems((prevItems) => {
      toast.info(`Quantidade atualizada: ${product.name}`);
      return prevItems.map((item) =>
        item.id === product.id ? { ...item, quantity: +quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (product) => {
    setCartItems((prevItems) => {
      toast.error(`${product.name} removido do carrinho.`);
      return prevItems.filter((item) => item.id !== product.id);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar cartCount={cartCount} search={search} setSearch={setSearch} />
        <Box sx={{ minHeight: "calc(100vh - 64px)", py: 3 }}>
          <Routes>
            <Route path="/" element={<Catalog onAddToCart={handleAddToCart} search={search} setSearch={setSearch} />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  onUpdateCart={handleUpdateCart}
                  onRemoveFromCart={handleRemoveFromCart}
                />
              }
            />
            <Route
              path="/thank-you"
              element={
                <ThankYouPage clearCart={() => setCartItems([])} />
              }
            />
          </Routes>
        </Box>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
