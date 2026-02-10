import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        if (savedToken && savedRole) {
            setToken(savedToken);
            setRole(savedRole);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        const { token: jwt, role: userRole } = res.data;
        localStorage.setItem('token', jwt);
        localStorage.setItem('role', userRole);
        setToken(jwt);
        setRole(userRole);
        if (userRole === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/user');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
