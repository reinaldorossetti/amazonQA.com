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
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

const Product = ({ product = {}, onAddToCart = () => {} }) => {
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const safeProduct = {
    id: product.id ?? "unknown",
    image: product.image ?? "",
    name: product.name ?? "Produto",
    description: product.description ?? "",
    category: product.category ?? "Geral",
    price: Number.isFinite(product.price) ? product.price : 0,
  };

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
      <Box id={`product-card-image-wrapper-${safeProduct.id}`}
        onClick={() => navigate(`/product/${safeProduct.id}`)}
        sx={{ cursor: "pointer", p: 1 }}
      >
        <CardMedia
          component="img"
          height="200"
          image={safeProduct.image}
          alt={safeProduct.name}
          sx={{ objectFit: "contain" }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Chip
          label={safeProduct.category}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1, fontSize: "0.7rem" }}
        />
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.3, cursor: "pointer", "&:hover": { color: "primary.main" } }}
          onClick={() => navigate(`/product/${safeProduct.id}`)}
        >
          {safeProduct.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.82rem" }}>
          {safeProduct.description}
        </Typography>
        <Typography variant="h6" color="primary" fontWeight={700}>
          R$ {safeProduct.price.toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <InputLabel id={`qty-label-${product.id}`}>{t("cart_item.qty").replace(":", "")}</InputLabel>
          <Select
            labelId={`qty-label-${safeProduct.id}`}
            value={quantity}
            label={t("cart_item.qty").replace(":", "")}
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
            onClick={() => onAddToCart(safeProduct, quantity)}
            sx={{ flexGrow: 1 }}
          >
            {t("product.add_to_cart")}
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default Product;
