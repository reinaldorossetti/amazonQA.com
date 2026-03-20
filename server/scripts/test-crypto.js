import pg from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runTest() {
  try {
    const testUser = {
      first_name: "John",
      last_name: "Security",
      email: `test_crypto_${Date.now()}@example.com`,
      password: "MySuperSecretPassword123!",
      person_type: "PF"
    };

    console.log("1. Registrando novo usuário via API...");
    const regRes = await fetch("http://localhost:3001/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    if (!regRes.ok) {
        throw new Error(`Falha no registro: ${await regRes.text()}`);
    }
    const regData = await regRes.json();
    console.log("✅ Usuário registrado com sucesso:", regData);

    console.log("\n2. Consultando o banco de dados para verificar o formato da senha...");
    const dbRes = await pool.query("SELECT email, password FROM users WHERE email = $1", [testUser.email]);
    const storedUser = dbRes.rows[0];
    
    console.log("🔒 Senha armazenada no banco:", storedUser.password);
    if (storedUser.password.startsWith("$2b$")) {
        console.log("✅ CRIPTOGRAFIA VALIDADA! A senha está no formato de hash do bcrypt ($2b$).");
    } else {
        console.log("❌ AVISO: A senha NÃO parece estar usando hash do bcrypt.");
    }

    console.log("\n3. Fazendo login com a senha original para testar a validação do hash...");
    const loginRes = await fetch("http://localhost:3001/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (!loginRes.ok) {
        throw new Error(`Falha no login: ${await loginRes.text()}`);
    }
    const loginData = await loginRes.json();
    console.log("✅ Login validado com sucesso! Dados retornados:", loginData);

  } catch (error) {
    console.error("Erro durante o teste:", error.message);
  } finally {
    await pool.end();
  }
}

runTest();
