/**
 * DatabaseContext.jsx
 *
 * Simple provider that kicks off the Web Worker (and therefore the SQLite DB
 * initialisation) as soon as the app mounts.  Components import individual
 * functions from database.js directly — no React context is needed to pass
 * the DB instance around.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProducts } from '../db/api';


const DatabaseContext = createContext({ ready: false });

export const DatabaseProvider = ({ children }) => {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Use a lightweight ping (getProducts) to detect when the API is ready
        getProducts()
            .then(() => setReady(true))
            .catch((err) => {
                console.error('Failed to initialize DB', err);
                setError(err.message);
            });
    }, []);

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
                Erro ao carregar o banco de dados. Verifique o console.
            </div>
        );
    }

    if (!ready) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Carregando banco de dados...
            </div>
        );
    }

    return (
        <DatabaseContext.Provider value={{ ready }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => useContext(DatabaseContext);
