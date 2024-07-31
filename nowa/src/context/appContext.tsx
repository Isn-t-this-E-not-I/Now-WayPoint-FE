import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppState {
    theme: 'light' | 'dark';
    setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const defaultAppState: AppState = {
    theme: 'light',
    setTheme: () => { }
};

const AppContext = createContext<AppState>(defaultAppState);

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
        <AppContext.Provider value={{ theme, setTheme }}>
            {children}
        </AppContext.Provider>
    );
};