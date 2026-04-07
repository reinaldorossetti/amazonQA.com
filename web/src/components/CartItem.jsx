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
        px: 0,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 3 },
      }}
    >
      {/* Product Image */}
      <Box sx={{ minWidth: { xs: "100%", sm: "180px" }, display: "flex", justifyContent: "center" }}>
        <Box
          component="img"
          src={safeItem.image}
          alt={safeItem.name}
          sx={{ width: 150, height: 150, objectFit: "contain", cursor: "pointer" }}
        />
      </Box>

      {/* Product Details & Actions */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, pr: { xs: 0, sm: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem", lineHeight: 1.3, cursor: "pointer", "&:hover": { color: "#c45500", textDecoration: "underline" } }}>
            {safeItem.name}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ textAlign: "right", ml: 2 }}>
             R$ {safeItem.price.toFixed(2)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#007600", fontWeight: 600, mt: 0.5, mb: 1 }}>
          In Stock
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", backgroundColor: "#F0F2F2", borderRadius: 2, border: "1px solid #D5D9D9", px: 1, py: 0.5, mr: 1, boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)" }}>
            <Typography variant="body2" sx={{ mr: 1 }}>Qty:</Typography>
            <Box
              component="select"
              value={safeItem.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0) handleUpdateCart(safeItem, val);
              }}
              style={{ background: "transparent", border: "none", outline: "none", cursor: "pointer", fontWeight: 600 }}
            >
              {[...Array(10).keys()].map(x => (
                 <option key={x+1} value={x+1}>{x+1}</option>
              ))}
            </Box>
          </Box>
          <Typography variant="body2" color="divider">|</Typography>
          <Typography variant="body2" color="primary" sx={{ cursor: "pointer", "&:hover": { color: "#c45500", textDecoration: "underline" } }} onClick={() => handleRemoveFromCart(safeItem)}>
            Delete
          </Typography>
          <Typography variant="body2" color="divider">|</Typography>
          <Typography variant="body2" color="primary" sx={{ cursor: "pointer", "&:hover": { color: "#c45500", textDecoration: "underline" } }}>
            Save for later
          </Typography>
          <Typography variant="body2" color="divider">|</Typography>
          <Typography variant="body2" color="primary" sx={{ cursor: "pointer", "&:hover": { color: "#c45500", textDecoration: "underline" } }}>
             Compare with similar items
          </Typography>
        </Box>
      </Box>
    </ListItem>
  );
};

export default CartItem;
