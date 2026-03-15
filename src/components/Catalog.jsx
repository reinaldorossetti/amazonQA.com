import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Product from "./Product";
import productsData from "../data/products_mock.json";

const Catalog = ({ onAddToCart, search, setSearch }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    setProducts(productsData);
  }, []);

  const categories = ["Todos", ...new Set(productsData.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "Todos" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Catálogo de Produtos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
          <TextField
            size="small"
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                clickable
                color={selectedCategory === cat ? "primary" : "default"}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
            <Product product={product} onAddToCart={onAddToCart} />
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum produto encontrado.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Catalog;
