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
    shipping_cost: Number.isFinite(product.shipping_cost) ? product.shipping_cost : 0,
    originalPrice: Number.isFinite(product.originalPrice) ? product.originalPrice : null,
    discountPercentage: Number.isFinite(product.discountPercentage)
      ? product.discountPercentage
      : null,
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #D5D9D9",
        boxShadow: "none",
        transition: "border 0.2s",
        "&:hover": {
          border: "1px solid #007185", // Blue highlight on hover instead of shadow
        },
      }}
    >
      <Box id={`product-card-image-wrapper-${safeProduct.id}`}
        onClick={() => navigate(`/product/${safeProduct.id}`)}
        sx={{ cursor: "pointer", p: 2, pb: 0 }}
      >
        <CardMedia
          component="img"
          height="180"
          image={safeProduct.image}
          alt={safeProduct.name}
          sx={{ objectFit: "contain" }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 0, pt: 1, display: "flex", flexDirection: "column" }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontSize: "1rem", 
            fontWeight: 400, 
            lineHeight: 1.3, 
            minHeight: "2.6em", 
            color: "#0F1111",
            cursor: "pointer", 
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            "&:hover": { color: "#c45500" } 
          }}
          onClick={() => navigate(`/product/${safeProduct.id}`)}
        >
          {safeProduct.name}
        </Typography>

        <Box id="product-rating-dummy" sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 0.5 }}>
           <Typography sx={{ color: "#FFA41C", fontSize: "14px" }}>★★★★☆</Typography>
           <Typography sx={{ color: "#007185", fontSize: "12px", "&:hover": { color: "#c45500", cursor: "pointer", textDecoration: "underline" } }}>
             {Math.floor(Math.random() * 5000) + 100}
           </Typography>
        </Box>

        {safeProduct.originalPrice !== null && safeProduct.originalPrice > safeProduct.price && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 0.75 }}>
            <Typography sx={{ color: "#565959", fontSize: "12px", textDecoration: "line-through" }}>
              R$ {safeProduct.originalPrice.toFixed(2)}
            </Typography>
            <Chip
              size="small"
              label={`-${safeProduct.discountPercentage ?? 10}%`}
              sx={{
                height: 20,
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "#cc0c39",
                color: "#fff",
              }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "baseline", mb: 0.5 }}>
           <Typography variant="h5" color="text.primary" fontWeight={700}>
             <Typography component="span" sx={{ fontSize: "12px", position: "relative", top: "-5px" }}>R$</Typography>
             {Math.floor(safeProduct.price)}
             <Typography component="span" sx={{ fontSize: "12px", position: "relative", top: "-5px" }}>
                {(safeProduct.price % 1).toFixed(2).substring(2)}
             </Typography>
           </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#007600", fontWeight: 600, fontSize: "12px", mb: 1.5, mt: "auto" }}>
          In Stock
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap", pt: 0 }}>
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
