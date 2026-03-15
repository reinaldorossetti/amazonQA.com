import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { useLanguage } from "../contexts/LanguageContext";

const CheckoutButton = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      toast.success(t("checkout.processing")); // Replaced "Compra finalizada com sucesso!"
      navigate("/thank-you", { state: { cartItems } }); // Passa os cartItems via state
      // Não limpe o cartItems aqui, deixamos a ThankYouPage limpar
    } else {
      toast.error(t("checkout.toast.empty"));
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      startIcon={<ShoppingCartCheckoutIcon />}
      onClick={handleCheckout}
      sx={{ py: 1.5, fontSize: "1.1rem" }}
      disabled={cartItems.length === 0}
    >
      {t("checkout.button")}
    </Button>
  );
};

export default CheckoutButton;
