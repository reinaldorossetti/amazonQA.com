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

const CartItem = ({ item, onUpdateCart, onRemoveFromCart }) => {
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        py: 2,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 0 },
      }}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            src={item.image}
            alt={item.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" fontWeight={600} sx={{ pr: 3 }}>
              {item.name}
            </Typography>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              R$ {item.price.toFixed(2)}
            </Typography>
          }
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: { xs: "100%", sm: "auto" },
          pl: { xs: 0, sm: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            type="number"
            size="small"
            label="Qtd"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0) onUpdateCart(item, val);
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
            R$ {(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Box>

        <Tooltip title="Remover item">
          <IconButton
            edge="end"
            aria-label="delete"
            color="error"
            onClick={() => onRemoveFromCart(item)}
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
