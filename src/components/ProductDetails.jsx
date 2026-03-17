import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
  IconButton
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLanguage } from "../contexts/LanguageContext";
import { getProductById } from "../db/api";


const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Carregando detalhes...
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          {t("product_details.not_found")}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mt: 3 }}
        >
          {t("product_details.back")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ mb: 3 }}
      >
        {t("product_details.back")}
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={4}>
          {/* Coluna da Imagem */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box id="product-details-image"
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 500,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </Grid>

          {/* Coluna de Informações */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight={800} sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              {product.name}
            </Typography>

            <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 3 }}>
              R$ {product.price.toFixed(2)}
            </Typography>

            <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", color: "text.primary", mb: 4 }}>
              {product.description}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Detalhes (Fabricante, Linha, Modelo) */}
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("product_details.details_title")}
            </Typography>
            <TableContainer sx={{ mb: 4, width: "100%", maxWidth: 400 }}>
              <Table size="small">
                <TableBody>
                  {product.manufacturer && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, borderBottom: "none", pl: 0, py: 1, color: "text.secondary" }}>
                        {t("product_details.manufacturer")}:
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none", py: 1, fontWeight: 500 }}>
                        {product.manufacturer}
                      </TableCell>
                    </TableRow>
                  )}
                  {product.line && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, borderBottom: "none", pl: 0, py: 1, color: "text.secondary" }}>
                        {t("product_details.line")}:
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none", py: 1, fontWeight: 500 }}>
                        {product.line}
                      </TableCell>
                    </TableRow>
                  )}
                  {product.model && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, borderBottom: "none", pl: 0, py: 1, color: "text.secondary" }}>
                        {t("product_details.model")}:
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none", py: 1, fontWeight: 500 }}>
                        {product.model}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Ações (Quantidade e Carrinho) */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
              <Box id="product-details-actions-wrapper" sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl sx={{ minWidth: 100 }}>
                  <InputLabel id="qty-label">{t("cart_item.qty").replace(":", "")}</InputLabel>
                  <Select
                    labelId="qty-label"
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

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => onAddToCart(product, quantity)}
                  sx={{ flexGrow: 1, py: 1.5, fontSize: "1.05rem" }}
                >
                  {t("product.add_to_cart")}
                </Button>
              </Box>
            </Paper>

          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetails;
