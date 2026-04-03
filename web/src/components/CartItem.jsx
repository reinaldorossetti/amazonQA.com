import React from "react";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Typography,
  Box,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useLanguage } from "../contexts/LanguageContext";

const CartItem = ({ item, onUpdateCart, onRemoveFromCart, onChange, onRemove }) => {
  const { t } = useLanguage();
  const handleUpdateCart = onUpdateCart || onChange || (() => {});
  const handleRemoveFromCart = onRemoveFromCart || onRemove || (() => {});
  const safeItem = {
    id: item?.id,
    image: item?.image ?? "",
    name: item?.name ?? "Item",
    price: Number.isFinite(item?.price) ? item.price : 0,
    quantity: Number.isFinite(item?.quantity) && item.quantity > 0 ? item.quantity : 1,
  };
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        py: 2,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 0 },
      }}
    >
      <Box id="cart-item-details-wrapper" sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            src={safeItem.image}
            alt={safeItem.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" fontWeight={600} sx={{ pr: 3 }}>
              {safeItem.name}
            </Typography>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              R$ {safeItem.price.toFixed(2)}
            </Typography>
          }
        />
      </Box>

      <Box id="cart-item-actions-wrapper"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: { xs: "100%", sm: "auto" },
          pl: { xs: 0, sm: 2 },
        }}
      >
        <Box id="cart-item-quantity-wrapper" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            type="number"
            size="small"
            label={t("cart_item.qty")}
            value={safeItem.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0) handleUpdateCart(safeItem, val);
            }}
            inputProps={{ min: 1, style: { textAlign: "center", width: 40 } }}
            sx={{ width: 80 }}
          />

          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="primary"
            sx={{ minWidth: 90, textAlign: "right" }}
          >
            R$ {(safeItem.price * safeItem.quantity).toFixed(2)}
          </Typography>
        </Box>

        <Tooltip title={t("cart_item.delete")}>
          <IconButton
            edge="end"
            aria-label="delete"
            color="error"
            onClick={() => handleRemoveFromCart(safeItem)}
            sx={{ ml: 2 }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </ListItem>
  );
};

export default CartItem;
