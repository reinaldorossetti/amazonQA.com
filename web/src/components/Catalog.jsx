import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Grid,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Product from "./Product";
import { useLanguage } from "../contexts/LanguageContext";
import { getProducts } from "../db/api";

const OFERTAS_DO_DIA_DISCOUNT_PERCENT = 10;

const normalizeValue = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const Catalog = ({
  onAddToCart = () => {},
  search = "",
  setSearch = () => {},
  selectedSubnavFilter = "all",
  onSubnavFilterChange = () => {},
}) => {
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

  useEffect(() => {
    const allCategories = t("catalog.all_categories");
    const subnavCategoryMap = {
      all: allCategories,
      "venda-amazon": "Venda na Amazon",
      "games": "Games",
      "livros": "Livros",
      "mais-vendidos": "Mais Vendidos",
    };

    setSelectedCategory(subnavCategoryMap[selectedSubnavFilter] || allCategories);
  }, [selectedSubnavFilter, t]);

  const categories = [t("catalog.all_categories"), ...new Set(products.map((p) => p.category))];

  const subnavFilterMatchers = {
    all: () => true,
    "venda-amazon": (product) => {
      const haystack = normalizeValue(
        `${product.name} ${product.description} ${product.category} ${product.manufacturer}`
      );
      return haystack.includes("amazon") || normalizeValue(product.category) === "venda na amazon";
    },
    "chega-15-min": (product) => {
      if (typeof product.deliveryMinutes === "number") {
        return product.deliveryMinutes <= 15;
      }

      const haystack = normalizeValue(`${product.name} ${product.description}`);
      return haystack.includes("15 min") || haystack.includes("15min") || haystack.includes("entrega rapida");
    },
    "ofertas-dia": (product) => {
      const haystack = normalizeValue(`${product.name} ${product.description}`);
      return (
        haystack.includes("oferta") ||
        haystack.includes("promoc") ||
        haystack.includes("desconto") ||
        haystack.includes(" off") ||
        haystack.includes("% off")
      );
    },
    "mais-vendidos": (product) => normalizeValue(product.category) === "mais vendidos",
    games: (product) => normalizeValue(product.category) === "games",
    livros: (product) => normalizeValue(product.category) === "livros",
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === t("catalog.all_categories") || p.category === selectedCategory;

    const matchSubnav = (subnavFilterMatchers[selectedSubnavFilter] || subnavFilterMatchers.all)(p);
    return matchSearch && matchCategory && matchSubnav;
  });

  const isOfertasDoDiaSelected = selectedSubnavFilter === "ofertas-dia";

  const productsToRender = isOfertasDoDiaSelected
    ? filtered.map((product) => {
        const originalPrice = Number(product.price);
        const discountedPrice = Number(
          (originalPrice * (1 - OFERTAS_DO_DIA_DISCOUNT_PERCENT / 100)).toFixed(2)
        );

        return {
          ...product,
          originalPrice,
          price: discountedPrice,
          discountPercentage: OFERTAS_DO_DIA_DISCOUNT_PERCENT,
        };
      })
    : filtered;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);

    const categoryToSubnavMap = {
      Games: "games",
      Livros: "livros",
      "Mais Vendidos": "mais-vendidos",
    };

    if (category === t("catalog.all_categories")) {
      onSubnavFilterChange("all");
      return;
    }

    onSubnavFilterChange(categoryToSubnavMap[category] || "all");
  };

  return (
    <Box sx={{ backgroundColor: "#eaeded", minHeight: "100vh", pb: 5 }}>
      {/* Main Catalog Products */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box id="catalog-header-wrapper" sx={{ backgroundColor: "#fff", p: 3 }}>
           <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("catalog.title")}
           </Typography>
           
           {/* Filters */}
           <Box id="catalog-search-filters-wrapper" sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
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
                   onClick={() => handleCategorySelect(cat)}
                   variant={selectedCategory === cat ? "filled" : "outlined"}
                 />
               ))}
             </Stack>
           </Box>

           <Typography
             id="catalog-products-found-text"
             variant="body2"
             color="text.secondary"
             sx={{ mb: 2 }}
           >
             {t("catalog.products_found", {
               count: productsToRender.length,
               plural: productsToRender.length === 1 ? "" : "s",
             })}
           </Typography>

           <Box sx={{ 
             display: 'grid', 
             gridTemplateColumns: { 
               xs: 'repeat(1, 1fr)', 
               sm: 'repeat(2, 1fr)', 
               md: 'repeat(3, 1fr)', 
               lg: 'repeat(4, 1fr)', 
               xl: 'repeat(6, 1fr)' 
             }, 
             gap: 2 
           }}>
             {isLoading ? (
                <Box id="catalog-loading-wrapper" sx={{ gridColumn: '1 / -1', width: "100%", textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Carregando produtos...
                  </Typography>
                </Box>
             ) : (
               productsToRender.map((product) => (
                 <Box key={product.id}>
                   <Product product={product} onAddToCart={onAddToCart} />
                 </Box>
               ))
             )}
           </Box>

           {!isLoading && productsToRender.length === 0 && (
             <Box id="catalog-empty-wrapper" sx={{ textAlign: "center", py: 8 }}>
               <Typography variant="h6" color="text.secondary">
                 {t("catalog.no_products")}
               </Typography>
             </Box>
           )}
        </Box>
      </Container>
    </Box>
  );
};

export default Catalog;
