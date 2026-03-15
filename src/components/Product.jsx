import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

const Product = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Chip
          label={product.category}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1, fontSize: "0.7rem" }}
        />
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.3 }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.82rem" }}>
          {product.description}
        </Typography>
        <Typography variant="h6" color="primary" fontWeight={700}>
          R$ {product.price.toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <InputLabel id={`qty-label-${product.id}`}>Qtd</InputLabel>
          <Select
            labelId={`qty-label-${product.id}`}
            value={quantity}
            label="Qtd"
            onChange={(e) => setQuantity(e.target.value)}
          >
            {[...Array(10).keys()].map((x) => (
              <MenuItem key={x + 1} value={x + 1}>
                {x + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="Adicionar ao carrinho">
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => onAddToCart(product, quantity)}
            sx={{ flexGrow: 1 }}
          >
            Adicionar
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default Product;
