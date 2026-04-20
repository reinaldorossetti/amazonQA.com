package com.amazonqa.android.ui.features.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazonqa.android.R
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.AppStrings

@Composable
fun LoginScreen(
    viewModel: LoginViewModel, 
    onNavigateToRegister: () -> Unit,
    onSkip: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val state by viewModel.state.collectAsState()

    Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "Amazon Logo",
            modifier = Modifier.height(60.dp).fillMaxWidth(),
            contentScale = ContentScale.Fit
        )
        Spacer(Modifier.height(48.dp))

        OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(AppStrings.loginEmail) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(AppStrings.loginPassword) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
        )

        Spacer(Modifier.height(24.dp))

        Button(
                onClick = { viewModel.login(email, password) },
                modifier = Modifier.fillMaxWidth().height(48.dp),
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
        Text("Autor: Reinaldo M R Junior", color = Color.Gray, fontSize = 14.sp)
    }
}

@Composable
fun RegisterScreen(viewModel: LoginViewModel, onBack: () -> Unit) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val state by viewModel.state.collectAsState()

    Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
    ) {
        Text(AppStrings.registerTitle, style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(24.dp))

        OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("Nome") },
                modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Sobrenome") },
                modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("E-mail") },
                modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Senha (mínimo 6 caracteres)") },
                modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(24.dp))

        Button(
                onClick = { viewModel.register(firstName, lastName, email, password) },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AmazonOrange)
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text("Criar conta", color = Color.White)
            }
        }
        
        TextButton(onClick = onBack) { Text("Já tem conta? Entrar") }

        if (state is AuthState.Error) {
            Text((state as AuthState.Error).message, color = Color.Red)
        }
    }
}
