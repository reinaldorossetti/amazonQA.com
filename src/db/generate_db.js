import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import mock data
const productsMockPath = path.join(__dirname, '../data/products_mock.json');
const productsMock = JSON.parse(fs.readFileSync(productsMockPath, 'utf8'));

const createDatabase = async () => {
    console.log("Inicializando o sql.js...");
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    console.log("Criando a tabela de produtos...");
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price REAL,
            description TEXT,
            category TEXT,
            image TEXT,
            manufacturer TEXT,
            line TEXT,
            model TEXT
        );
    `);

    console.log("Povoando a base de dados com products_mock.json...");
    const stmt = db.prepare(`
        INSERT INTO products (id, name, price, description, category, image, manufacturer, line, model) 
        VALUES ($id, $name, $price, $description, $category, $image, $manufacturer, $line, $model)
    `);
    
    db.run("BEGIN TRANSACTION;");
    productsMock.forEach(p => {
        stmt.run({
            $id: p.id,
            $name: p.name,
            $price: p.price,
            $description: p.description,
            $category: p.category,
            $image: p.image,
            $manufacturer: p.manufacturer || null,
            $line: p.line || null,
            $model: p.model || null
        });
    });
    db.run("COMMIT;");
    stmt.free();

    // Export the database to a Uint8Array
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Save to src/db/ecommerce.sqlite
    const dbPath = path.join(__dirname, 'ecommerce.sqlite');
    fs.writeFileSync(dbPath, buffer);
    console.log(`\nBanco de dados criado com sucesso em: ${dbPath}`);
};

createDatabase().catch(err => {
    console.error("Erro ao criar o banco de dados:", err);
});
