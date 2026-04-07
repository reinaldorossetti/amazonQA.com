import React from "react";
import { Box, Typography, Container, Grid, Link as MuiLink } from "@mui/material";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box id="footer-wrapper" sx={{ mt: "auto", fontFamily: "Amazon Ember, Arial, sans-serif" }}>
      {/* Back to top */}
      <Box
        id="footer-back-to-top"
        onClick={handleBackToTop}
        sx={{
          backgroundColor: "#37475A",
          py: 2,
          textAlign: "center",
          color: "#fff",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#475A6E" },
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "13px" }}>
          Voltar ao início
        </Typography>
      </Box>

      {/* Main Links */}
      <Box id="footer-links-wrapper" sx={{ backgroundColor: "#232F3E", color: "#fff", pt: 5, pb: 4 }}>
        <Container maxWidth="lg" sx={{ maxWidth: "1000px !important" }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "16px", mb: 2 }}>
                Conheça-nos
              </Typography>
              <MuiLink href="https://www.aboutamazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Sobre a Amazon</MuiLink>
              <MuiLink href="https://www.aboutamazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Informações corporativas</MuiLink>
              <MuiLink href="https://www.amazon.jobs/pt-br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Carreiras</MuiLink>
              <MuiLink href="https://www.aboutamazon.com.br/noticias" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Comunicados à imprensa</MuiLink>
              <MuiLink href="https://www.aboutamazon.com.br/impacto" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Comunidade</MuiLink>
              <MuiLink href="https://www.amazon.com.br/b?node=21216503011" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Acessibilidade</MuiLink>
              <MuiLink href="https://www.amazon.science/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Amazon Science</MuiLink>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "16px", mb: 2 }}>
                Ganhe dinheiro conosco
              </Typography>
              <MuiLink href="https://venda.amazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Venda na Amazon</MuiLink>
              <MuiLink href="https://brandservices.amazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Proteja e construa a sua marca</MuiLink>
              <MuiLink href="https://venda.amazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Forneça para a Amazon</MuiLink>
              <MuiLink href="https://kdp.amazon.com/pt_BR/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Publique seus livros</MuiLink>
              <MuiLink href="https://associados.amazon.com.br/" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Seja um associado</MuiLink>
              <MuiLink href="https://ads.amazon.com/pt-br" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Anuncie seus produtos</MuiLink>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "16px", mb: 2 }}>
                Pagamento
              </Typography>
              <MuiLink href="https://www.amazon.com.br/b?node=17387340011" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Meios de Pagamento</MuiLink>
              <MuiLink href="https://www.amazon.com.br/b?node=21325178011" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Compre com Pontos</MuiLink>
              <MuiLink href="https://www.amazon.com.br/b?node=17387340011" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Cartão de crédito Amazon</MuiLink>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "16px", mb: 2 }}>
                Deixe-nos ajudar você
              </Typography>
              <MuiLink href="https://www.amazon.com.br/gp/css/homepage.html" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Sua conta</MuiLink>
              <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201910060" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Frete e prazo de entrega</MuiLink>
              <MuiLink href="https://www.amazon.com.br/gp/css/returns/homepage.html" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Devoluções e reembolsos</MuiLink>
              <MuiLink href="https://www.amazon.com.br/hz/mycd/myx" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Gerencie seu conteúdo e dispositivos</MuiLink>
              <MuiLink href="https://www.amazon.com.br/Recalls-e-Alertas-de-Seguran%C3%A7a/b?node=33189917011" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Recalls e alertas de segurança do produto</MuiLink>
              <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html" target="_blank" color="inherit" underline="hover" display="block" variant="body2" mb={1.2} sx={{ color: "#DDDDDD", fontSize: "14px" }}>Ajuda</MuiLink>
            </Grid>
          </Grid>
        </Container>

        {/* Separator inside the blue box */}
        <Box sx={{ borderTop: "1px solid #3a4553", mt: 5, pt: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Box
             component="img"
             src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
             alt="Amazon Logo"
             sx={{ height: 30, filter: "brightness(0) invert(1)" }}
          />
          <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #848688", borderRadius: "3px", px: 1.5, py: 0.5, cursor: "pointer", "&:hover": { borderColor: "#ccc" } }}>
            <Box component="span" sx={{ fontSize: "18px", mr: 1, position: "relative", top: "1px" }}>🇧🇷</Box>
            <Typography variant="body2" sx={{ color: "#ccc", fontSize: "13px" }}>Brasil</Typography>
          </Box>
        </Box>
      </Box>

      {/* Copyright Legal Base */}
      <Box id="footer-legal-wrapper" sx={{ backgroundColor: "#131921", color: "#ccc", py: 4, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 1, flexWrap: "wrap", justifyContent: "center" }}>
          <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201002280" target="_blank" color="inherit" underline="hover" variant="body2" sx={{ fontSize: "12px" }}>Condições de Uso</MuiLink>
          <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201006660" target="_blank" color="inherit" underline="hover" variant="body2" sx={{ fontSize: "12px" }}>Notificação de Privacidade</MuiLink>
          <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201890250" target="_blank" color="inherit" underline="hover" variant="body2" sx={{ fontSize: "12px" }}>Cookies</MuiLink>
          <MuiLink href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201890280" target="_blank" color="inherit" underline="hover" variant="body2" sx={{ fontSize: "12px" }}>Anúncios Baseados em Interesses</MuiLink>
        </Box>
        <Typography variant="body2" sx={{ fontSize: "12px", mb: 3 }}>
          © 2021-2026 Amazon.com, Inc. ou suas afiliadas
        </Typography>

        <Typography variant="body2" sx={{ fontSize: "11px", color: "#999", mb: 3 }}>
          Amazon Serviços de Varejo do Brasil Ltda. | CNPJ 15.436.940/0001-03
        </Typography>

        <Typography variant="body2" sx={{ fontSize: "11px", color: "#999", mb: 3 }}>
          Av. Juscelino Kubitschek, 2041, Torre E, 18º andar - São Paulo CEP: 04543-011 | <MuiLink href="https://www.amazon.com.br/gp/help/customer/contact-us" target="_blank" color="inherit" underline="hover">Fale conosco</MuiLink> | ajuda-amazon@amazon.com.br
        </Typography>

        <Typography variant="body2" sx={{ fontSize: "11px", color: "#999" }}>
          Formas de pagamento aceitas: cartões de crédito (Visa, MasterCard, Elo e American Express), cartões de débito (Visa e Elo), Boleto e Pix.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
