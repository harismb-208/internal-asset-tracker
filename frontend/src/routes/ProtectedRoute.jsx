import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ allowedRole, children }) {
    const { token, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading…</p>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== allowedRole) {
        const redirect = role === 'ADMIN' ? '/admin' : '/user';
        return <Navigate to={redirect} replace />;
    }

    return children;
}
