import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LockIcon from "@mui/icons-material/Lock";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { createOrder } from "../db/api";

const CheckoutButton = ({ cartItems = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn ?? auth?.isAuthenticated ?? false;
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handleCheckout = async () => {
    if (safeCartItems.length === 0) {
      toast.error(t("checkout.toast.empty"));
      return;
    }

    if (!isLoggedIn) {
      toast.info("Faça login para finalizar seu pedido.");
      // Preserve current path so we can come back after login
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}`;

      const orderItems = safeCartItems
        .map((item) => ({
          productId: Number(item?.product_id ?? item?.id),
          quantity: Number(item?.quantity ?? 1),
        }))
        .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && Number.isInteger(item.quantity) && item.quantity > 0);

      const order = await createOrder({ idempotencyKey, items: orderItems });
      toast.success(t("checkout.processing"));
      navigate("/payments", {
        state: {
          cartItems: safeCartItems,
          order,
        },
      });
    } catch (err) {
      toast.error(err?.message || "Erro ao processar checkout.");
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      startIcon={isLoggedIn ? <ShoppingCartCheckoutIcon /> : <LockIcon />}
      onClick={handleCheckout}
      sx={{ py: 1.5, fontSize: "1.1rem" }}
      disabled={safeCartItems.length === 0}
    >
      {isLoggedIn ? t("checkout.button") : "Entrar para Finalizar"}
    </Button>
  );
};

export default CheckoutButton;
