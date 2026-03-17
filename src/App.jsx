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
import ProductDetails from "./components/ProductDetails";
import Register from "./components/Register";
import Login from "./components/Login";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#131921", // Amazon Dark Blue (Navbar)
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
          backgroundColor: "#0f1111", // Amazon's specific top navbar color
        },
      },
    },
  },
});

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const NavBar = ({ cartCount, search, setSearch }) => {
  const { language, toggleLanguage, setAppLanguage, t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#131921", border: "none", borderRadius: 0 }}>
      {/* Container fluido zero padding lateral para ficar igual Amazon (ponta a ponta) */}
      <Toolbar disableGutters sx={{ minHeight: "60px !important", px: 2, display: "flex", alignItems: "center", gap: 1 }}>

        {/* Logo Ouro da Amazon, escrito amazonQA.com */}
        <Box id="nav-logo-wrapper"
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
          <Box id="nav-logo-img"
            component="img"
            src="/logo.PNG"
            alt="Logo"
            sx={{
              height: { xs: "30px", sm: "40px" },
              objectFit: "contain"
            }}
          />
        </Box>

        {/* Botão de Catálogo */}
        <Box id="nav-catalog-btn"
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
          <Typography sx={{ fontSize: "0.75rem", color: "#ccc", lineHeight: 1 }}>{t("nav.browse")}</Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1 }}>{t("nav.catalog")}</Typography>
        </Box>

        {/* Barra de Pesquisa Central Estilo Amazon */}
        <Box id="nav-search-bar-wrapper"
          sx={{
            display: { xs: "none", sm: "flex" },
            flexGrow: 1,
            height: 40,
            borderRadius: "4px", // Amazon search has mildly rounded corners inside
            overflow: "hidden",
            "&:focus-within": {
              boxShadow: "0 0 0 2px #f90, 0 0 0 3px #0f1111",
            },
            mx: 1
          }}
        >
          <Box id="nav-search-category-dropdown"
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
            {t("nav.all")}
          </Box>
          <Box id="nav-search-input"
            component="input"
            placeholder={t("nav.search_placeholder")}
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
          <Box id="nav-search-submit"
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

        {/* Language Toggle */}
        <Box id="nav-language-toggle"
          onClick={toggleLanguage}
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#fff",
            px: 1,
            py: 1,
            cursor: "pointer",
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { border: "1px solid #fff" },
          }}
        >
          <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase" }}>
            {language}
          </Typography>
        </Box>

        {/* Auth area: show user+logout when logged in, or register link when not */}
        {isLoggedIn ? (
          <Box id="nav-user-area" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              id="nav-user-greeting"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#fff",
                px: 1,
                py: 1,
                borderRadius: "2px",
                border: "1px solid transparent",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "#ccc", lineHeight: 1 }}>{t("nav.hello")}</Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </Typography>
            </Box>
            <Box
              id="nav-logout-btn"
              onClick={logout}
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#ccc",
                px: 0.5,
                py: 1,
                cursor: "pointer",
                borderRadius: "2px",
                border: "1px solid transparent",
                "&:hover": { border: "1px solid #fff", color: "#fff" },
              }}
            >
              <LogoutIcon fontSize="small" />
            </Box>
          </Box>
        ) : (
          <Box
            id="nav-register-btn"
            component={Link}
            to="/register"
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
            <Typography sx={{ fontSize: "0.75rem", color: "#ccc", lineHeight: 1 }}>{t("nav.new_customer")}</Typography>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1 }}>{t("nav.start_here")}</Typography>
          </Box>
        )}

        {/* Carrinho Estilo Amazon idêntico: número flutuante laranja sob SVG */}
        <Box id="nav-cart-btn"
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
          <Box id="nav-cart-icon-wrapper" sx={{ position: "relative", width: 40, height: 35 }}>
            <Box id="nav-cart-count-badge"
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
            {t("nav.cart")}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const AppInner = () => {
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        toast.info(t("app.toast.qty_updated", { name: product.name }));
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
      } else {
        toast.success(t("app.toast.added", { name: product.name }));
        return [...prevItems, { ...product, quantity: Number(quantity) }];
      }
    });
  };

  const handleUpdateCart = (product, quantity) => {
    setCartItems((prevItems) => {
      toast.info(t("app.toast.qty_updated", { name: product.name }));
      return prevItems.map((item) =>
        item.id === product.id ? { ...item, quantity: +quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (product) => {
    setCartItems((prevItems) => {
      toast.error(t("app.toast.removed", { name: product.name }));
      return prevItems.filter((item) => item.id !== product.id);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar cartCount={cartCount} search={search} setSearch={setSearch} />
        <Box id="main-content-wrapper" sx={{ minHeight: "calc(100vh - 64px)", py: 3 }}>
          <Routes>
            <Route path="/" element={<Catalog onAddToCart={handleAddToCart} search={search} setSearch={setSearch} />} />
            <Route path="/product/:id" element={<ProductDetails onAddToCart={handleAddToCart} />} />
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
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
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

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppInner />
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
