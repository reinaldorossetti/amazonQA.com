package com.amazonqa.android.ui.features.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import com.amazonqa.android.R
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.AppStrings

@Composable
fun LoginScreen(viewModel: LoginViewModel, onNavigateToRegister: () -> Unit, onSkip: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val state by viewModel.state.collectAsState()

    Column(
            modifier = Modifier.fillMaxSize().background(Color.Black).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
    ) {
        Image(
                painter = painterResource(id = com.amazonqa.android.R.drawable.logo),
                contentDescription = "Amazon Logo",
                modifier = Modifier.height(60.dp).fillMaxWidth().testTag("login_logo"),
                contentScale = ContentScale.Fit
        )
        Spacer(Modifier.height(48.dp))

        OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(AppStrings.loginEmail) },
                modifier = Modifier.fillMaxWidth().testTag("login_email_field"),
                shape = RoundedCornerShape(8.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = { focusManager.moveFocus(FocusDirection.Down) }
                ),
                colors =
                        OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedLabelColor = AmazonOrange,
                                unfocusedLabelColor = Color.LightGray,
                                focusedBorderColor = AmazonOrange,
                                unfocusedBorderColor = Color.Gray
                        )
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(AppStrings.loginPassword) },
                modifier = Modifier.fillMaxWidth().testTag("login_password_field"),
                shape = RoundedCornerShape(8.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                keyboardActions = KeyboardActions(
                    onDone = { 
                        focusManager.clearFocus()
                        viewModel.login(email, password) 
                    }
                ),
                visualTransformation = if (passwordVisible) androidx.compose.ui.text.input.VisualTransformation.None else androidx.compose.ui.text.input.PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.LockOpen else Icons.Default.Lock,
                            contentDescription = if (passwordVisible) "Esconder senha" else "Mostrar senha",
                            tint = Color.Gray
                        )
                    }
                },
                colors =
                        OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedLabelColor = AmazonOrange,
                                unfocusedLabelColor = Color.LightGray,
                                focusedBorderColor = AmazonOrange,
                                unfocusedBorderColor = Color.Gray
                        )
        )

        Spacer(Modifier.height(24.dp))

        Button(
                onClick = { viewModel.login(email, password) },
                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("login_submit_button"),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AmazonOrange)
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text(AppStrings.loginContinue, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }

        Spacer(Modifier.height(16.dp))

        TextButton(onClick = onNavigateToRegister, modifier = Modifier.testTag("login_register_button")) {
            Text(AppStrings.loginRegister, color = AmazonBlueLink)
        }

        TextButton(onClick = onSkip, modifier = Modifier.testTag("login_skip_button")) { Text(AppStrings.loginSkip, color = AmazonBlueLink) }

        if (state is AuthState.Error) {
            Spacer(Modifier.height(16.dp))
            Text(
                    text = (state as AuthState.Error).message,
                    color = Color.Red,
                    fontSize = 14.sp,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier.testTag("login_error_message")
            )
        }

        Spacer(Modifier.height(16.dp))
        Text("Autor: Reinaldo M R Junior", color = Color.LightGray, fontSize = 14.sp)
    }
}

@Composable
fun RegisterScreen(viewModel: LoginViewModel, onBack: () -> Unit) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var cpf by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var isPessoaFisica by remember { mutableStateOf(true) }
    var showErrors by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        onDispose {
            viewModel.setStep(1)
        }
    }

    // Address fields for Step 2
    var cep by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var number by remember { mutableStateOf("") }
    var complement by remember { mutableStateOf("") }
    var neighborhood by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var stateCode by remember { mutableStateOf("") }
    var residenceProofFileName by remember { mutableStateOf("") }

    val focusManager = LocalFocusManager.current
    val state by viewModel.state.collectAsState()
    val currentStep by viewModel.registrationStep.collectAsState()
    val cepData by viewModel.addressData.collectAsState()

    // Auto-fill address when CEP is fetched
    LaunchedEffect(cepData) {
        cepData?.let {
            street = it.logradouro
            neighborhood = it.bairro
            city = it.localidade
            stateCode = it.uf
        }
    }

    // Trigger CEP fetch
    LaunchedEffect(cep) {
        val cleanCep = cep.replace("-", "").replace(".", "")
        if (cleanCep.length == 8) {
            viewModel.fetchAddressByCep(cleanCep)
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(Color.White)) {
        // Dark Header
        Surface(
                modifier = Modifier.fillMaxWidth().height(60.dp).testTag("register_header"),
                color = Color(0xFF232F3E),
                shape = RectangleShape
        ) {
            Column(modifier = Modifier.padding(horizontal = 24.dp), verticalArrangement = Arrangement.Center) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                            Icons.Default.Person,
                            null,
                            tint = AmazonOrange,
                            modifier = Modifier.size(24.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Text(
                            "Criar Conta",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        LazyColumn(
                modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(Modifier.height(24.dp))
                
                // Stepper Component
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Step 1
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Surface(
                            shape = androidx.compose.foundation.shape.CircleShape,
                            color = if (currentStep >= 1) AmazonGreen else Color.LightGray,
                            modifier = Modifier.size(28.dp)
                        ) {
                            if (currentStep > 1) {
                                Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.padding(4.dp))
                            } else {
                                Text("1", color = Color.White, modifier = Modifier.wrapContentSize(), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Text("Dados Pessoais", fontSize = 10.sp, fontWeight = if (currentStep == 1) FontWeight.Bold else FontWeight.Normal)
                    }

                    Box(modifier = Modifier.width(80.dp).height(2.dp).background(if (currentStep > 1) AmazonGreen else Color.LightGray).padding(horizontal = 8.dp))

                    // Step 2
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Surface(
                            shape = androidx.compose.foundation.shape.CircleShape,
                            color = if (currentStep >= 2) AmazonOrange else Color.LightGray,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Text("2", color = Color.White, modifier = Modifier.wrapContentSize(), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("Endereço & Documentos", fontSize = 10.sp, fontWeight = if (currentStep == 2) FontWeight.Bold else FontWeight.Normal)
                    }
                }
                
                Spacer(Modifier.height(32.dp))

                if (currentStep == 1) {
                    // PF/PJ Tabs (Only in Step 1)
                    Row(
                            modifier =
                                    Modifier.fillMaxWidth()
                                            .height(48.dp)
                                            .background(Color(0xFFF7F7F7), RectangleShape),
                            verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                                modifier =
                                        Modifier.weight(1f).fillMaxHeight().clickable {
                                            isPessoaFisica = true
                                        }.testTag("register_tab_pf"),
                                color = if (isPessoaFisica) Color(0xFF232F3E) else Color.Transparent,
                                shape = RectangleShape
                        ) {
                            Row(
                                    Modifier.fillMaxSize(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                        Icons.Default.Person,
                                        null,
                                        tint = if (isPessoaFisica) AmazonOrange else Color.Gray,
                                        modifier = Modifier.size(18.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                        "Pessoa Física (CPF)",
                                        color = if (isPessoaFisica) AmazonOrange else Color.Gray,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Surface(
                                modifier =
                                        Modifier.weight(1f).fillMaxHeight().clickable {
                                            isPessoaFisica = false
                                        }.testTag("register_tab_pj"),
                                color = if (!isPessoaFisica) Color(0xFF232F3E) else Color.Transparent,
                                shape = RectangleShape
                        ) {
                            Row(
                                    Modifier.fillMaxSize(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                        Icons.Default.Business,
                                        null,
                                        tint = if (!isPessoaFisica) AmazonOrange else Color.Gray,
                                        modifier = Modifier.size(18.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                        "Pessoa Jurídica (CNPJ)",
                                        color = if (!isPessoaFisica) AmazonOrange else Color.Gray,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }

            if (currentStep == 1) {
                item {
                    Row(Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                                value = firstName,
                                onValueChange = { firstName = it },
                                label = { Text("Nome *") },
                                modifier = Modifier.weight(1f).testTag("register_firstname_field"),
                                shape = RoundedCornerShape(8.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                                isError = showErrors && firstName.isBlank(),
                                supportingText = if (showErrors && firstName.isBlank()) {
                                    { Text("Campo obrigatório", color = Color.Red) }
                                } else null
                        )
                        Spacer(Modifier.width(12.dp))
                        OutlinedTextField(
                                value = lastName,
                                onValueChange = { lastName = it },
                                label = { Text("Sobrenome *") },
                                modifier = Modifier.weight(1f).testTag("register_lastname_field"),
                                shape = RoundedCornerShape(8.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                                isError = showErrors && lastName.isBlank(),
                                supportingText = if (showErrors && lastName.isBlank()) {
                                    { Text("Campo obrigatório", color = Color.Red) }
                                } else null
                        )
                    }
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                            value = cpf,
                            onValueChange = { cpf = it },
                            label = { Text(if (isPessoaFisica) "CPF *" else "CNPJ *") },
                            modifier = Modifier.fillMaxWidth().testTag("register_cpf_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                            isError = showErrors && cpf.isBlank(),
                            supportingText = {
                                if (showErrors && cpf.isBlank()) {
                                    Text("Campo obrigatório", color = Color.Red)
                                } else {
                                    Text("Formato: ${if(isPessoaFisica) "000.000.000-00" else "00.000.000/0000-00"}")
                                }
                            }
                    )
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email *") },
                            modifier = Modifier.fillMaxWidth().testTag("register_email_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                            isError = showErrors && email.isBlank(),
                            supportingText = if (showErrors && email.isBlank()) {
                                { Text("Campo obrigatório", color = Color.Red) }
                            } else null
                    )
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Telefone / WhatsApp *") },
                            modifier = Modifier.fillMaxWidth().testTag("register_phone_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Phone,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                            isError = showErrors && phone.isBlank(),
                            supportingText = {
                                if (showErrors && phone.isBlank()) {
                                    Text("Campo obrigatório", color = Color.Red)
                                } else {
                                    Text("Formato: (00) 00000-0000")
                                }
                            }
                    )
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Senha *") },
                            modifier = Modifier.fillMaxWidth().testTag("register_password_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                            isError = showErrors && (password.isBlank() || password.length < 8),
                            visualTransformation =
                                    if (passwordVisible)
                                            androidx.compose.ui.text.input.VisualTransformation.None
                                    else androidx.compose.ui.text.input.PasswordVisualTransformation(),
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                            if (passwordVisible) Icons.Default.LockOpen
                                            else Icons.Default.Lock,
                                            contentDescription = if (passwordVisible) "Esconder senha" else "Mostrar senha"
                                    )
                                }
                            },
                            supportingText = {
                                if (showErrors && password.isBlank()) {
                                    Text("Campo obrigatório", color = Color.Red)
                                } else if (password.length > 0 && password.length < 8) {
                                    Text("Mínimo 8 caracteres", color = Color.Red)
                                } else {
                                    Text("Mínimo 8 caracteres")
                                }
                            }
                    )
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                            value = confirmPassword,
                            onValueChange = { confirmPassword = it },
                            label = { Text("Confirmar Senha *") },
                            modifier = Modifier.fillMaxWidth().testTag("register_confirm_password_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(onDone = { 
                                focusManager.clearFocus()
                            }),
                            isError = showErrors && (confirmPassword.isBlank() || confirmPassword != password),
                            visualTransformation =
                                    if (confirmPasswordVisible)
                                            androidx.compose.ui.text.input.VisualTransformation.None
                                    else androidx.compose.ui.text.input.PasswordVisualTransformation(),
                            trailingIcon = {
                                IconButton(
                                        onClick = { confirmPasswordVisible = !confirmPasswordVisible }
                                ) {
                                    Icon(
                                            if (confirmPasswordVisible) Icons.Default.LockOpen
                                            else Icons.Default.Lock,
                                            contentDescription = if (confirmPasswordVisible) "Esconder senha" else "Mostrar senha"
                                    )
                                }
                            },
                            supportingText = if (showErrors && confirmPassword.isBlank()) {
                                { Text("Campo obrigatório", color = Color.Red) }
                            } else if (showErrors && confirmPassword != password) {
                                { Text("As senhas não conferem", color = Color.Red) }
                            } else null
                    )
                }
            } else {
                // Step 2: Address & Documents
                item {
                    OutlinedTextField(
                        value = cep,
                        onValueChange = { if (it.length <= 9) cep = it },
                        label = { Text("CEP *") },
                        modifier = Modifier.fillMaxWidth().testTag("register_cep_field"),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                        keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) }),
                        supportingText = { Text("Digite o CEP para preenchimento automático") },
                        trailingIcon = {
                            if (cepData != null) {
                                Icon(Icons.Default.CheckCircle, null, tint = AmazonGreen)
                            }
                        }
                    )
                    Spacer(Modifier.height(12.dp))

                    Row(Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = street,
                            onValueChange = { street = it },
                            label = { Text("Logradouro *") },
                            modifier = Modifier.weight(2f).testTag("register_street_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) })
                        )
                        Spacer(Modifier.width(12.dp))
                        OutlinedTextField(
                            value = number,
                            onValueChange = { number = it },
                            label = { Text("Número *") },
                            modifier = Modifier.weight(1f).testTag("register_number_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) })
                        )
                    }
                    Spacer(Modifier.height(12.dp))

                    Row(Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = complement,
                            onValueChange = { complement = it },
                            label = { Text("Complemento") },
                            modifier = Modifier.weight(1f).testTag("register_complement_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            supportingText = { Text("Opcional") },
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) })
                        )
                        Spacer(Modifier.width(12.dp))
                        OutlinedTextField(
                            value = neighborhood,
                            onValueChange = { neighborhood = it },
                            label = { Text("Bairro *") },
                            modifier = Modifier.weight(1f).testTag("register_neighborhood_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) })
                        )
                    }
                    Spacer(Modifier.height(12.dp))

                    Row(Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = city,
                            onValueChange = { city = it },
                            label = { Text("Cidade *") },
                            modifier = Modifier.weight(2f).testTag("register_city_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Next) })
                        )
                        Spacer(Modifier.width(12.dp))
                        OutlinedTextField(
                            value = stateCode,
                            onValueChange = { stateCode = it },
                            label = { Text("UF *") },
                            modifier = Modifier.weight(1f).testTag("register_state_field"),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
                        )
                    }

                    Spacer(Modifier.height(32.dp))
                    
                    // Residence Proof Section
                    Text("Comprovante de Residência", color = Color.Gray, fontSize = 12.sp)
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { residenceProofFileName = "comprovante_residencia.pdf" },
                        modifier = Modifier.fillMaxWidth().height(56.dp).testTag("register_file_picker_button"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Black)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.UploadFile, null)
                            Spacer(Modifier.width(8.dp))
                            Text(if (residenceProofFileName.isEmpty()) "Selecionar arquivo (PDF, JPG ou PNG)" else residenceProofFileName)
                        }
                    }
                    Text("Conta de luz, água, gás ou telefone fixo. Máx. 10 MB.", color = Color.Gray, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
                }
            }

            item {
                Spacer(Modifier.height(32.dp))
            }

                item {
                    Row(Modifier.fillMaxWidth()) {
                        if (currentStep == 2) {
                            OutlinedButton(
                                onClick = { viewModel.setStep(1) },
                                modifier = Modifier.weight(1f).height(56.dp).testTag("register_back_step_button"),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Black)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                                    Spacer(Modifier.width(4.dp))
                                    Text("Voltar", fontWeight = FontWeight.Bold, maxLines = 1)
                                }
                            }
                            Spacer(Modifier.width(12.dp))
                        }

                        Button(
                            onClick = {
                                if (currentStep == 1) {
                                    if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || 
                                        password.isBlank() || password.length < 8 || 
                                        confirmPassword != password || cpf.isBlank() || phone.isBlank()) {
                                        showErrors = true
                                    } else {
                                        showErrors = false
                                        viewModel.setStep(2)
                                    }
                                } else {
                                    if (cep.isBlank() || street.isBlank() || number.isBlank() || 
                                        neighborhood.isBlank() || city.isBlank() || stateCode.isBlank()) {
                                        showErrors = true
                                    } else {
                                        val addressMap = mapOf(
                                            "cep" to cep,
                                            "street" to street,
                                            "number" to number,
                                            "complement" to complement,
                                            "neighborhood" to neighborhood,
                                            "city" to city,
                                            "state" to stateCode
                                        )
                                        viewModel.register(
                                            firstName, 
                                            lastName, 
                                            email, 
                                            password,
                                            if (isPessoaFisica) "PF" else "PJ",
                                            cpf,
                                            phone,
                                            addressMap
                                        )
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f).height(56.dp).testTag("register_submit_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            if (state is AuthState.Loading) {
                                CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(24.dp))
                            } else {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (currentStep == 1) {
                                        Text("Próximo: Endereço", color = Color.Black, fontWeight = FontWeight.Bold, maxLines = 1)
                                        Spacer(Modifier.width(4.dp))
                                        Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = Color.Black)
                                    } else {
                                        Icon(Icons.Default.PersonAdd, null, tint = Color.Black)
                                        Spacer(Modifier.width(4.dp))
                                        Text("Criar Conta", color = Color.Black, fontWeight = FontWeight.Bold, maxLines = 1)
                                    }
                                }
                            }
                        }
                    }
                }

                item {
                    Spacer(Modifier.height(24.dp))
                    Text("Já tem uma conta?", color = Color.Gray, fontSize = 14.sp)
                    TextButton(
                            onClick = onBack,
                            modifier =
                                    Modifier.border(1.dp, Color(0xFF3F51B5), RoundedCornerShape(8.dp))
                                            .width(120.dp)
                                            .height(40.dp)
                    ) { Text("Fazer login", color = Color(0xFF3F51B5)) }
                    Spacer(Modifier.height(32.dp))

                    if (state is AuthState.Error) {
                        Text(
                                (state as AuthState.Error).message,
                                color = Color.Red,
                                modifier = Modifier.padding(bottom = 16.dp)
                        )
                    }
                }
        }
    }
}
