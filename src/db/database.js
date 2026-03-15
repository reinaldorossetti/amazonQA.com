import initSqlJs from 'sql.js';
import productsMock from '../data/products_mock.json';

let dbPromise = null;

const createDatabase = async () => {
    // 1. Load the WebAssembly module
    const SQL = await initSqlJs({
        // This URLs assumes we copied sql-wasm.wasm to public/ (which we did)
        locateFile: file => `/${file}`
    });

    // 2. Load existing DB from localStorage or create a fresh one
    const savedDb = localStorage.getItem('sqlite_db');
    let db;
    if (savedDb) {
        try {
            const binaryString = atob(savedDb);
            const binaryLen = binaryString.length;
            const bytes = new Uint8Array(binaryLen);
            for (let i = 0; i < binaryLen; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            db = new SQL.Database(bytes);
        } catch(e) {
            console.error("Failed to load saved DB, creating a new one", e);
            db = new SQL.Database();
        }
    } else {
        db = new SQL.Database();
    }
    
    // 3. Create products table
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

    // 4. Sync mock data to ensure any new products added to the JSON are inserted
    const stmt = db.prepare(`
        INSERT INTO products (id, name, price, description, category, image, manufacturer, line, model) 
        VALUES ($id, $name, $price, $description, $category, $image, $manufacturer, $line, $model)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            price = excluded.price,
            description = excluded.description,
            category = excluded.category,
            image = excluded.image,
            manufacturer = excluded.manufacturer,
            line = excluded.line,
            model = excluded.model
    `);
    
    db.run("BEGIN TRANSACTION;");
    let addedCount = 0;
    productsMock.forEach(p => {
        // Checking if product exists theoretically not needed with IGNORE, but we can track if we need to save
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
    
    // Always resave to sync in case new products were ignored/inserted
    saveDatabase(db);

    return db;
};

// 5. Utility to Save DB to LocalStorage (since this is an in-memory SQLite setup in the browser)
export const saveDatabase = (db) => {
    const binaryArray = db.export();
    const binaryLen = binaryArray.byteLength;
    let binaryString = "";
    for (let i = 0; i < binaryLen; i++) {
        binaryString += String.fromCharCode(binaryArray[i]);
    }
    const base64String = btoa(binaryString);
    localStorage.setItem('sqlite_db', base64String);
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};

// Helper: Get all products
export const getProducts = async () => {
    const db = await getDatabase();
    const res = db.exec("SELECT * FROM products ORDER BY name ASC");
    if (res.length === 0) return [];
    
    // Convert SQL.js result payload back to array of objects
    const columns = res[0].columns;
    const values = res[0].values;
    
    return values.map(row => {
        let obj = {};
        columns.forEach((col, idx) => {
            obj[col] = row[idx];
        });
        return obj;
    });
};

// Helper: Get single product by ID
export const getProductById = async (id) => {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM products WHERE id = :id");
    stmt.bind({":id": Number(id)});
    
    if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        return result;
    }
    stmt.free();
    return null;
};
