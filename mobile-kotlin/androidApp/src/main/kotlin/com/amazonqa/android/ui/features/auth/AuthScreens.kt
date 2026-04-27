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
                modifier = Modifier.height(60.dp).fillMaxWidth(),
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
                modifier = Modifier.fillMaxWidth().height(48.dp),
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

        TextButton(onClick = onNavigateToRegister) {
            Text(AppStrings.loginRegister, color = AmazonBlueLink)
        }

        TextButton(onClick = onSkip) { Text(AppStrings.loginSkip, color = AmazonBlueLink) }

        if (state is AuthState.Error) {
            Spacer(Modifier.height(16.dp))
            Text(
                    text = (state as AuthState.Error).message,
                    color = Color.Red,
                    fontSize = 14.sp,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
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

    val focusManager = LocalFocusManager.current
    val state by viewModel.state.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(Color.White)) {
        // Dark Header
        Surface(
                modifier = Modifier.fillMaxWidth().height(60.dp),
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
                // Stepper placeholder
                Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                            shape = androidx.compose.foundation.shape.CircleShape,
                            color = AmazonOrange,
                            modifier = Modifier.size(24.dp)
                    ) {
                        Text(
                                "1",
                                color = Color.White,
                                modifier = Modifier.wrapContentSize(),
                                fontSize = 12.sp
                        )
                    }
                    Box(modifier = Modifier.width(100.dp).height(1.dp).background(Color.LightGray))
                    Surface(
                            shape = androidx.compose.foundation.shape.CircleShape,
                            color = Color.LightGray,
                            modifier = Modifier.size(24.dp)
                    ) {
                        Text(
                                "2",
                                color = Color.White,
                                modifier = Modifier.wrapContentSize(),
                                fontSize = 12.sp
                        )
                    }
                }
                Text("Dados Pessoais", fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
                Spacer(Modifier.height(32.dp))

                // PF/PJ Tabs
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
                                    },
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
                                    },
                            color = if (!isPessoaFisica) Color(0xFF232F3E) else Color.Transparent,
                            shape = RectangleShape
                    ) {
                        Row(
                                Modifier.fillMaxSize(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                    Icons.Default.Build,
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

            item {
                Row(Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("Nome *") },
                            modifier = Modifier.weight(1f),
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
                            modifier = Modifier.weight(1f),
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
                        modifier = Modifier.fillMaxWidth(),
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
                        modifier = Modifier.fillMaxWidth(),
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
                        modifier = Modifier.fillMaxWidth(),
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
                        modifier = Modifier.fillMaxWidth(),
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
                        modifier = Modifier.fillMaxWidth(),
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

                Spacer(Modifier.height(32.dp))

                Button(
                        onClick = {
                            if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || 
                                password.isBlank() || password.length < 8 || 
                                confirmPassword != password || cpf.isBlank() || phone.isBlank()) {
                                showErrors = true
                            } else {
                                viewModel.register(firstName, lastName, email, password)
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                        shape = RoundedCornerShape(8.dp)
                ) {
                    if (state is AuthState.Loading) {
                        CircularProgressIndicator(
                                color = Color.Black,
                                modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                    "Próximo: Endereço",
                                    color = Color.Black,
                                    fontWeight = FontWeight.Bold
                            )
                            Spacer(Modifier.width(8.dp))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, null, tint = Color.Black)
                        }
                    }
                }

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
