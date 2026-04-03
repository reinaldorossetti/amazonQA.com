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
import { useLanguage } from "../contexts/LanguageContext";
import { getProducts } from "../db/api";

const Catalog = ({ onAddToCart = () => {}, search = "", setSearch = () => {} }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Set initial category when translation is ready
  useEffect(() => {
    if (!selectedCategory && t("catalog.all_categories")) {
        setSelectedCategory(t("catalog.all_categories"));
    }
  }, [t, selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await getProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load products from SQLite", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const categories = [t("catalog.all_categories"), ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === t("catalog.all_categories") || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <Container maxWidth="lg">
      <Box id="catalog-header-wrapper" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("catalog.title")}
        </Typography>
        <Typography variant="body1" sx={{ color: "#fff", mb: 3 }}>
          {t("catalog.products_found", { count: filtered.length, plural: filtered.length !== 1 ? "s" : "" })}
        </Typography>

        <Box id="catalog-search-filters-wrapper" sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
          <TextField
            size="small"
            placeholder={t("catalog.search_placeholder")}
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
        {isLoading ? (
           <Box id="catalog-loading-wrapper" sx={{ width: "100%", textAlign: "center", py: 8 }}>
             <Typography variant="h6" color="text.secondary">
               Carregando produtos...
             </Typography>
           </Box>
        ) : (
          filtered.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Product product={product} onAddToCart={onAddToCart} />
            </Grid>
          ))
        )}
      </Grid>

      {!isLoading && filtered.length === 0 && (
        <Box id="catalog-empty-wrapper" sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {t("catalog.no_products")}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Catalog;
