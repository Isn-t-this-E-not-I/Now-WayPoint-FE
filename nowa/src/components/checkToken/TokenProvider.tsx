import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

interface TokenContextProps {
    token: string | null;
    setToken: (token: string | null) => void;
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
    const navigate = useNavigate();

    const checkAuthorizationHeader = async (): Promise<void> => {
        const apiUrl = import.meta.env.VITE_APP_API;

        try {
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
                navigate("/auth")
            }
        } catch (error) {
            console.error('Error checking Authorization header:', error);
            await axios.post(
                'https://subdomain.now-waypoint.store:8080/api/follow/logoutInfo',
                {
                nickname: localStorage.getItem('nickname')
                },
                {
                headers: {
                    'Content-Type': 'application/json'
                }
                }
            )
            localStorage.removeItem('token');
            setToken(null);
            navigate("/auth")
        }
    };

    useEffect(() => {
        checkAuthorizationHeader();
    }, []);

    return (
        <TokenContext.Provider value={{ token, setToken}}>
            {children}
        </TokenContext.Provider>
    );
};