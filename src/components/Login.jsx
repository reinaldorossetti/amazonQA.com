import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../db/api";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Where to redirect after successful login (supports ?next=/some-path)
  const params = new URLSearchParams(location.search);
  const nextPath = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles the login form submission.
   *
   * Looks up the email in the database via {@link getUserByEmail}, then
   * compares the provided password against the stored value. On success,
   * calls {@link AuthContext.login} to persist the session and redirects
   * the user to `nextPath` (from the `?next=` query parameter, defaulting
   * to `'/'`).
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const dbUser = await loginUser({ email: email.trim().toLowerCase(), password });

      login({
        id: dbUser.id,
        name: dbUser.first_name,
        lastName: dbUser.last_name,
        email: dbUser.email,
        personType: dbUser.person_type,
      });

      toast.success(`Bem-vindo(a) de volta, ${dbUser.first_name}! 👋`);
      navigate(nextPath);
    } catch (err) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      id="login-page-wrapper"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#eaeded",
        py: 4,
        px: 2,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        {/* Card */}
        <Paper
          id="login-card"
          elevation={2}
          sx={{
            border: "1px solid #D5D9D9",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header strip */}
          <Box
            id="login-header"
            sx={{
              background: "linear-gradient(135deg, #131921 0%, #37475A 100%)",
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <LockPersonIcon sx={{ color: "#ff9900", fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#fff">
                Entrar
              </Typography>
              <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>
                tester<span style={{ color: "#ff9900" }}>.com</span>
              </Typography>
            </Box>
          </Box>

          {/* Form */}
          <Box
            id="login-form-body"
            component="form"
            onSubmit={handleSubmit}
            sx={{ px: 4, py: 3 }}
          >
            {error && (
              <Alert
                id="login-error-alert"
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <TextField
              id="login-email"
              label="E-mail"
              fullWidth
              size="small"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              id="login-password"
              label="Senha"
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 0.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              id="login-forgot-password"
              variant="caption"
              sx={{
                color: "#0066c0",
                cursor: "pointer",
                display: "block",
                mb: 2.5,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Esqueceu a senha?
            </Typography>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#0F1111" }} />
                ) : (
                  <LoginIcon />
                )
              }
              sx={{
                backgroundColor: "#FFD814",
                color: "#0F1111",
                fontWeight: 700,
                border: "1px solid #FCD200",
                textTransform: "none",
                "&:hover": { backgroundColor: "#F7CA00" },
                boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
                mb: 1,
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Ao entrar, você concorda com os{" "}
              <Box
                component="span"
                sx={{ color: "#0066c0", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                Termos de Uso
              </Box>
              .
            </Typography>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Novo no amazonQA.com?
              </Typography>
            </Divider>

            <Button
              id="login-create-account-btn"
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                borderColor: "#D5D9D9",
                color: "#131921",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { borderColor: "#131921", backgroundColor: "#f7f7f7" },
              }}
            >
              Criar sua conta
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
