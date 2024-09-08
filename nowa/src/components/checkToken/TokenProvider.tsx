import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface TokenContextProps {
    token: string | null;
    setToken: (token: string | null) => void;
    ensureToken: () => Promise<string | null>;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

export const useToken = () => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error('useToken must be used within a TokenProvider');
    }
    return context;
};

interface TokenProviderProps {
    children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isTokenRefreshing, setIsTokenRefreshing] = useState<boolean>(false);

    const checkAuthorizationHeader = async (): Promise<void> => {
        const apiUrl = import.meta.env.VITE_APP_API;

        try {
            setIsTokenRefreshing(true);
            const response = await axios.get(`${apiUrl}/user/auth`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const newToken = response.data;  // Axios는 응답 데이터를 이미 파싱함
                localStorage.setItem('token', newToken);
                console.log('new Token! :' , newToken);
                setToken(newToken);
            } else {
                localStorage.removeItem('token');
                setToken(null);
            }
        } catch (error) {
            console.error('Error checking Authorization header:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setIsTokenRefreshing(false);
        }
    };

    useEffect(() => {
        checkAuthorizationHeader();
    }, []);

    // 토큰 갱신을 보장하는 함수 (await 사용으로 간단하게 변경)
    const ensureToken = async (): Promise<string | null> => {
        if (isTokenRefreshing) {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (!isTokenRefreshing) {
                        clearInterval(interval);
                        resolve(token);
                    }
                }, 100);
            });
        } else {
            return token;
        }
    };

    return (
        <TokenContext.Provider value={{ token, setToken, ensureToken }}>
            {!isTokenRefreshing && children}
        </TokenContext.Provider>
    );
};