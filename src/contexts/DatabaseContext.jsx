import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDatabase } from '../db/database';

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initDB = async () => {
            try {
                const database = await getDatabase();
                if (isMounted) {
                    setDb(database);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to initialize DB", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initDB();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando banco de dados...</div>;
    }

    if (!db) {
        return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Erro ao carregar o banco de dados. Verifique o console.</div>;
    }

    return (
        <DatabaseContext.Provider value={db}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};
