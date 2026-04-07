import React from "react";
import { Box, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const navLinks = [
  { key: "venda-amazon", label: "Venda na Amazon" },
  { key: "chega-15-min", label: "Chega em 15 min" },
  { key: "ofertas-dia", label: "Ofertas do Dia" },
  { key: "mais-vendidos", label: "Mais Vendidos" },
  { key: "games", label: "Games" },
  { key: "livros", label: "Livros" },
];

const subnav2Links = [
  { label: "Compras anteriores" },
  { label: "Ofertas", bold: true },
  { label: "Categorias ∨" },
  { label: "Saiba mais" },
  { label: "Ajuda" },
];

const Subnav = ({ selectedFilter = "all", onFilterChange = () => {} }) => {
  return (
    <>
      {/* ── Barra 2: Azul escuro (#232F3E) com links em branco ─────────── */}
      <Box
        id="nav-subheader-wrapper"
        sx={{
          backgroundColor: "#232F3E",
          color: "#fff",
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {/* ≡ Todos */}
        <Box
          id="nav-all-menu"
          component={Link}
          to="/"
          onClick={() => onFilterChange("all")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            px: 1.5,
            py: 0.75,
            textDecoration: "none",
            color: "#fff",
            border: selectedFilter === "all" ? "1px solid #fff" : "1px solid transparent",
            backgroundColor: selectedFilter === "all" ? "rgba(255,255,255,0.12)" : "transparent",
            "&:hover": { border: "1px solid #fff", borderRadius: "2px" },
            whiteSpace: "nowrap",
          }}
        >
          <MenuIcon sx={{ fontSize: "18px", color: "#fff", fontWeight: 800 }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 800, lineHeight: 1, color: "#fff", "& *": { fontWeight: 800 } }}>
            <strong>Todos</strong>
          </Typography>
        </Box>

        {/* Links de navegação */}
        {navLinks.map(({ key, label }) => (
          <Box
            id={`nav-submenu-${key}`}
            key={label}
            component={Link}
            to="/"
            onClick={() => onFilterChange(key)}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              px: 1,
              py: 0.75,
              textDecoration: "none",
              color: "#fff",
              border: selectedFilter === key ? "1px solid #fff" : "1px solid transparent",
              backgroundColor: selectedFilter === key ? "rgba(255,255,255,0.12)" : "transparent",
              "&:hover": { border: "1px solid #fff", borderRadius: "2px" },
              whiteSpace: "nowrap",
            }}
          >
            <Typography sx={{ fontSize: "14px", lineHeight: 1, color: "#fff", fontWeight: selectedFilter === key ? 700 : 400 }}>
              {label}
            </Typography>
          </Box>
        ))}

        {/* Espaço flexível */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Banner AO VIVO – laranja à direita */}
        <Box
          id="nav-live-banner"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            cursor: "pointer",
            borderLeft: "1px solid #37475A",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#007a33",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>C</Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#fff", mx: 0.25 }}>vs</Typography>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#003087",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#ff6900" }}>N</Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#fff", lineHeight: 1 }}>
              AO VIVO: QUINTA-FEIRA,
            </Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#ff9900", lineHeight: 1 }}>
              20:30
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Barra 3: "amazon now" com fundo escuro e fonte #FFF ──────────── */}
      <Box
        id="nav-amazon-now-bar"
        sx={{
          backgroundColor: "#37475A",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          px: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          minHeight: "38px",
        }}
      >
        {/* Logo "amazon now" */}
        <Box
          id="nav-amazon-now-logo"
          sx={{
            display: "flex",
            alignItems: "center",
            mr: 2,
            pr: 2,
            borderRight: "1px solid #546070",
            py: 0.5,
          }}
        >
          <Typography sx={{ fontSize: "16px", lineHeight: 1 }}>
            <Box component="span" sx={{ fontWeight: 700, fontStyle: "italic", color: "#ff9900" }}>
              amazon
            </Box>
            <Box component="span" sx={{ fontSize: "13px", color: "#fff", ml: 0.25 }}>
              now
            </Box>
          </Typography>
        </Box>

        {/* Links da terceira barra */}
        {subnav2Links.map((link) => (
          <Box
            key={link.label}
            component="a"
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              textDecoration: "none",
              color: "#fff",
              whiteSpace: "nowrap",
              fontSize: "14px",
              fontWeight: link.bold ? 700 : 400,
              "&:hover": { textDecoration: "underline", color: "#febd69" },
            }}
          >
            {link.label}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Subnav;
