import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import { useLanguage } from "../contexts/LanguageContext";
import { registerUser } from "../db/database";

// ─── Validation helpers ──────────────────────────────────────────────────────

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(digits[10]);
};

const validateCNPJ = (cnpj) => {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  const calc = (d, weights) =>
    d.reduce((acc, val, i) => acc + parseInt(val) * weights[i], 0);
  const mod = (n) => {
    const r = n % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, ...w1];
  const d = digits.split("");
  return (
    mod(calc(d.slice(0, 12), w1)) === parseInt(d[12]) &&
    mod(calc(d.slice(0, 13), w2)) === parseInt(d[13])
  );
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Mask helpers ────────────────────────────────────────────────────────────

const maskCPF = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const maskCNPJ = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,4})/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");

const maskPhone = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");

const maskCEP = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");

// ─── Password strength ───────────────────────────────────────────────────────

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Fraca", color: "error" };
  if (score === 2) return { label: "Regular", color: "warning" };
  if (score === 3) return { label: "Boa", color: "info" };
  return { label: "Forte", color: "success" };
};

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState = {
  personType: "PF",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  cpf: "",
  cnpj: "",
  companyName: "",
  password: "",
  confirmPassword: "",
  addressZip: "",
  addressStreet: "",
  addressNumber: "",
  addressComplement: "",
  addressNeighborhood: "",
  addressCity: "",
  addressState: "",
  residenceProof: null,
};

const initialErrors = Object.fromEntries(
  Object.keys(initialState).map((k) => [k, ""])
);

// ─── Register component ───────────────────────────────────────────────────────

const STEPS = ["Dados Pessoais", "Endereço & Documentos"];

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState(initialErrors);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepFound, setCepFound] = useState(null); // null | true | false
  const [submitting, setSubmitting] = useState(false);

  const isPF = form.personType === "PF";

  // ─── Field updater ──────────────────────────────────────────────────────────

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ─── CEP lookup ─────────────────────────────────────────────────────────────

  const handleCEP = async (raw) => {
    const masked = maskCEP(raw);
    set("addressZip", masked);
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepLoading(true);
      setCepFound(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepFound(false);
          setErrors((prev) => ({ ...prev, addressZip: "CEP não encontrado." }));
        } else {
          setCepFound(true);
          setForm((prev) => ({
            ...prev,
            addressStreet: data.logradouro || prev.addressStreet,
            addressNeighborhood: data.bairro || prev.addressNeighborhood,
            addressCity: data.localidade || prev.addressCity,
            addressState: data.uf || prev.addressState,
          }));
        }
      } catch {
        setCepFound(false);
        setErrors((prev) => ({ ...prev, addressZip: "Erro ao buscar CEP." }));
      } finally {
        setCepLoading(false);
      }
    }
  };

  // ─── Validation per step ────────────────────────────────────────────────────

  const validateStep0 = () => {
    const errs = { ...initialErrors };
    let ok = true;

    if (!form.firstName.trim()) { errs.firstName = "Nome é obrigatório."; ok = false; }
    if (!form.lastName.trim()) { errs.lastName = "Sobrenome é obrigatório."; ok = false; }
    if (!validateEmail(form.email)) { errs.email = "Email inválido."; ok = false; }
    if (!form.phone.replace(/\D/g, "") || form.phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Telefone inválido."; ok = false;
    }
    if (form.password.length < 8) { errs.password = "Mínimo 8 caracteres."; ok = false; }
    if (form.password !== form.confirmPassword) { errs.confirmPassword = "As senhas não coincidem."; ok = false; }

    if (isPF) {
      if (!validateCPF(form.cpf)) { errs.cpf = "CPF inválido."; ok = false; }
    } else {
      if (!validateCNPJ(form.cnpj)) { errs.cnpj = "CNPJ inválido."; ok = false; }
      if (!form.companyName.trim()) { errs.companyName = "Razão Social é obrigatória."; ok = false; }
    }

    setErrors(errs);
    return ok;
  };

  const validateStep1 = () => {
    const errs = { ...errors };
    let ok = true;

    if (!form.addressZip.replace(/\D/g, "") || form.addressZip.replace(/\D/g, "").length < 8) {
      errs.addressZip = "CEP obrigatório (8 dígitos)."; ok = false;
    }
    if (!form.addressStreet.trim()) { errs.addressStreet = "Logradouro é obrigatório."; ok = false; }
    if (!form.addressNumber.trim()) { errs.addressNumber = "Número é obrigatório."; ok = false; }
    if (!form.addressCity.trim()) { errs.addressCity = "Cidade é obrigatória."; ok = false; }
    if (!form.addressState.trim()) { errs.addressState = "Estado é obrigatório."; ok = false; }

    setErrors(errs);
    return ok;
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
  };

  const handleBack = () => setStep(0);

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setSubmitting(true);
    try {
      await registerUser({
        person_type: form.personType,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        cpf: isPF ? form.cpf : null,
        cnpj: !isPF ? form.cnpj : null,
        company_name: !isPF ? form.companyName.trim() : null,
        address_zip: form.addressZip,
        address_street: form.addressStreet,
        address_number: form.addressNumber,
        address_complement: form.addressComplement,
        address_neighborhood: form.addressNeighborhood,
        address_city: form.addressCity,
        address_state: form.addressState,
        residence_proof_filename: form.residenceProof?.name || null,
      });
      toast.success("Cadastro realizado com sucesso! Bem-vindo(a)! 🎉");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.message || "Erro ao realizar cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Strength bar ────────────────────────────────────────────────────────────

  const strength = form.password ? passwordStrength(form.password) : null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box
      id="register-page-wrapper"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#eaeded",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Card */}
        <Paper
          id="register-card"
          elevation={2}
          sx={{
            border: "1px solid #D5D9D9",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header strip */}
          <Box
            id="register-header"
            sx={{
              background: "linear-gradient(135deg, #131921 0%, #37475A 100%)",
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <HowToRegIcon sx={{ color: "#ff9900", fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#fff">
                Criar Conta
              </Typography>
              <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>
                tester<span style={{ color: "#ff9900" }}>.com</span>
              </Typography>
            </Box>
          </Box>

          {/* Stepper */}
          <Box id="register-stepper" sx={{ px: 4, pt: 3, pb: 1 }}>
            <Stepper activeStep={step} alternativeLabel>
              {STEPS.map((label, i) => (
                <Step key={label} completed={step > i}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": { fontSize: "0.78rem" },
                      "& .MuiStepIcon-root.Mui-active": { color: "#ff9900" },
                      "& .MuiStepIcon-root.Mui-completed": { color: "#067D62" },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider />

          {/* Form body */}
          <Box
            id="register-form-body"
            component="form"
            onSubmit={handleSubmit}
            sx={{ px: 4, py: 3 }}
          >
            {/* ── STEP 0 ───────────────────────────────────────────────────── */}
            {step === 0 && (
              <Box id="register-step0">
                {/* Toggle PF / PJ */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Tipo de Cadastro
                  </Typography>
                  <ToggleButtonGroup
                    id="register-person-type-toggle"
                    value={form.personType}
                    exclusive
                    onChange={(_, val) => val && set("personType", val)}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiToggleButton-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        py: 1,
                        border: "1.5px solid #D5D9D9",
                        "&.Mui-selected": {
                          backgroundColor: "#131921",
                          color: "#ff9900",
                          borderColor: "#131921",
                          "&:hover": { backgroundColor: "#37475A" },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="PF" id="register-toggle-pf">
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      Pessoa Física (CPF)
                    </ToggleButton>
                    <ToggleButton value="PJ" id="register-toggle-pj">
                      <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                      Pessoa Jurídica (CNPJ)
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* PJ: Razão Social + CNPJ */}
                {!isPF && (
                  <Box id="register-pj-fields" sx={{ mb: 2 }}>
                    <TextField
                      id="register-company-name"
                      label="Razão Social *"
                      fullWidth
                      size="small"
                      value={form.companyName}
                      onChange={(e) => set("companyName", e.target.value)}
                      error={!!errors.companyName}
                      helperText={errors.companyName}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      id="register-cnpj"
                      label="CNPJ *"
                      fullWidth
                      size="small"
                      value={form.cnpj}
                      onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
                      error={!!errors.cnpj}
                      helperText={errors.cnpj || "Formato: 00.000.000/0000-00"}
                      inputProps={{ maxLength: 18 }}
                    />
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Dados do Responsável
                      </Typography>
                    </Divider>
                  </Box>
                )}

                {/* Nome + Sobrenome */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="register-first-name"
                      label="Nome *"
                      fullWidth
                      size="small"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="register-last-name"
                      label="Sobrenome *"
                      fullWidth
                      size="small"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                </Grid>

                {/* CPF (PF only) */}
                {isPF && (
                  <TextField
                    id="register-cpf"
                    label="CPF *"
                    fullWidth
                    size="small"
                    value={form.cpf}
                    onChange={(e) => set("cpf", maskCPF(e.target.value))}
                    error={!!errors.cpf}
                    helperText={errors.cpf || "Formato: 000.000.000-00"}
                    inputProps={{ maxLength: 14 }}
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Email */}
                <TextField
                  id="register-email"
                  label={isPF ? "Email *" : "Email Corporativo *"}
                  fullWidth
                  size="small"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                />

                {/* Telefone */}
                <TextField
                  id="register-phone"
                  label="Telefone / WhatsApp *"
                  fullWidth
                  size="small"
                  value={form.phone}
                  onChange={(e) => set("phone", maskPhone(e.target.value))}
                  error={!!errors.phone}
                  helperText={errors.phone || "Formato: (00) 00000-0000"}
                  inputProps={{ maxLength: 15 }}
                  sx={{ mb: 2 }}
                />

                {/* Senha */}
                <TextField
                  id="register-password"
                  label="Senha *"
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || "Mínimo 8 caracteres"}
                  sx={{ mb: 1 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {strength && (
                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Força:
                    </Typography>
                    <Chip
                      id="register-password-strength"
                      label={strength.label}
                      color={strength.color}
                      size="small"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Box>
                )}

                {/* Confirmar Senha */}
                <TextField
                  id="register-confirm-password"
                  label="Confirmar Senha *"
                  fullWidth
                  size="small"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  id="register-next-btn"
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#FFD814",
                    color: "#0F1111",
                    fontWeight: 700,
                    border: "1px solid #FCD200",
                    "&:hover": { backgroundColor: "#F7CA00" },
                    boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
                  }}
                >
                  Próximo: Endereço
                </Button>
              </Box>
            )}

            {/* ── STEP 1 ───────────────────────────────────────────────────── */}
            {step === 1 && (
              <Box id="register-step1">
                {/* CEP */}
                <TextField
                  id="register-address-zip"
                  label="CEP *"
                  fullWidth
                  size="small"
                  value={form.addressZip}
                  onChange={(e) => handleCEP(e.target.value)}
                  error={!!errors.addressZip}
                  helperText={errors.addressZip || "Digite o CEP para preenchimento automático"}
                  inputProps={{ maxLength: 9 }}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {cepLoading && <CircularProgress size={18} />}
                        {cepFound === true && <CheckCircleIcon sx={{ color: "#067D62" }} fontSize="small" />}
                        {cepFound === false && (
                          <LocationOnIcon sx={{ color: "#d32f2f" }} fontSize="small" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Rua + Número */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      id="register-address-street"
                      label="Logradouro *"
                      fullWidth
                      size="small"
                      value={form.addressStreet}
                      onChange={(e) => set("addressStreet", e.target.value)}
                      error={!!errors.addressStreet}
                      helperText={errors.addressStreet}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      id="register-address-number"
                      label="Número *"
                      fullWidth
                      size="small"
                      value={form.addressNumber}
                      onChange={(e) => set("addressNumber", e.target.value)}
                      error={!!errors.addressNumber}
                      helperText={errors.addressNumber}
                    />
                  </Grid>
                </Grid>

                {/* Complemento + Bairro */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="register-address-complement"
                      label="Complemento"
                      fullWidth
                      size="small"
                      value={form.addressComplement}
                      onChange={(e) => set("addressComplement", e.target.value)}
                      helperText="Opcional"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="register-address-neighborhood"
                      label="Bairro"
                      fullWidth
                      size="small"
                      value={form.addressNeighborhood}
                      onChange={(e) => set("addressNeighborhood", e.target.value)}
                    />
                  </Grid>
                </Grid>

                {/* Cidade + Estado */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      id="register-address-city"
                      label="Cidade *"
                      fullWidth
                      size="small"
                      value={form.addressCity}
                      onChange={(e) => set("addressCity", e.target.value)}
                      error={!!errors.addressCity}
                      helperText={errors.addressCity}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      id="register-address-state"
                      label="UF *"
                      fullWidth
                      size="small"
                      value={form.addressState}
                      onChange={(e) => set("addressState", e.target.value.toUpperCase().slice(0, 2))}
                      error={!!errors.addressState}
                      helperText={errors.addressState}
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>
                </Grid>

                {/* Comprovante de Residência */}
                <Divider sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Comprovante de Residência
                  </Typography>
                </Divider>

                <Box id="register-residence-proof-wrapper" sx={{ mb: 3 }}>
                  <input
                    id="register-residence-proof-input"
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => set("residenceProof", e.target.files[0] || null)}
                  />
                  <Button
                    id="register-residence-proof-btn"
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      borderColor: "#D5D9D9",
                      color: "#0F1111",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#131921", backgroundColor: "#f7f7f7" },
                    }}
                  >
                    {form.residenceProof
                      ? form.residenceProof.name
                      : "Selecionar arquivo (PDF, JPG ou PNG)"}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Conta de luz, água, gás ou telefone fixo. Máx. 10 MB.
                  </Typography>
                  {form.residenceProof && (
                    <Alert severity="success" sx={{ mt: 1, py: 0 }}>
                      Arquivo selecionado: <strong>{form.residenceProof.name}</strong>
                    </Alert>
                  )}
                </Box>

                {/* Botões */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    id="register-back-btn"
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      flex: 1,
                      borderColor: "#D5D9D9",
                      color: "#131921",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { borderColor: "#131921", backgroundColor: "#f7f7f7" },
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    id="register-submit-btn"
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={
                      submitting ? <CircularProgress size={18} sx={{ color: "#0F1111" }} /> : <HowToRegIcon />
                    }
                    sx={{
                      flex: 2,
                      backgroundColor: "#FFA41C",
                      color: "#0F1111",
                      fontWeight: 700,
                      border: "1px solid #FF8F00",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#FA8900" },
                      boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
                    }}
                  >
                    {submitting ? "Cadastrando..." : "Criar Conta"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Already have account */}
            <Divider sx={{ my: 2.5 }} />
            <Typography variant="body2" align="center" color="text.secondary">
              Já tem uma conta?{" "}
              <Box
                component="span"
                id="register-signin-link"
                sx={{ color: "#0066c0", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => navigate("/login")}
              >
                Fazer login
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
