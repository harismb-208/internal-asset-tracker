import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

export default function UserDashboard() {
    const { logout } = useAuth();

    /* ──────────── state ──────────── */
    const [myAssets, setMyAssets] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [assetId, setAssetId] = useState('');
    const [tab, setTab] = useState('assets');

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [requestLoading, setRequestLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    /* ──────────── fetch helpers ──────────── */
    const fetchMyAssets = useCallback(async () => {
        try {
            const res = await API.get('/assets/my');
            setMyAssets(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchMyRequests = useCallback(async () => {
        try {
            const res = await API.get('/requests/my');
            setMyRequests(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchMyAssets(), fetchMyRequests()]);
        setLoading(false);
    }, [fetchMyAssets, fetchMyRequests]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ──────────── actions ──────────── */
    const handleRequestAsset = async (e) => {
        e.preventDefault();
        const id = assetId.trim();
        if (!id) return;

        // MongoDB ObjectIds are exactly 24 hex characters
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            setMsg({ text: 'Invalid Asset ID. It must be a 24-character hex string (e.g. 698aad2920c7a6466f618586). Copy the full ID from the Admin dashboard.', type: 'error' });
            return;
        }

        setRequestLoading(true);
        setMsg({ text: '', type: '' });
        try {
            await API.post('/requests', { assetId: id });
            setMsg({ text: 'Asset requested successfully!', type: 'success' });
            setAssetId('');
            fetchAll();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to request asset', type: 'error' });
        } finally {
            setRequestLoading(false);
        }
    };

    const handleReturn = async (requestId) => {
        setActionLoading(requestId);
        try {
            await API.patch(`/requests/return/${requestId}`);
            setMsg({ text: 'Asset returned successfully!', type: 'success' });
            fetchAll();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to return asset', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /* ──────────── status badge ──────────── */
    const statusBadge = (status) => (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    );

    /* ──────────── render ──────────── */
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading dashboard…</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* ── top bar ── */}
            <header className="topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 3h-8l-2 4h12z" />
                        </svg>
                        Asset Tracker
                    </h1>
                    <span className="role-chip">USER</span>
                </div>
                <button className="btn btn-ghost" onClick={logout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </header>

            {/* ── message banner ── */}
            {msg.text && (
                <div className={`msg-banner msg-${msg.type}`}>
                    {msg.text}
                    <button className="msg-close" onClick={() => setMsg({ text: '', type: '' })}>×</button>
                </div>
            )}

            {/* ── tab nav ── */}
            <nav className="tab-nav">
                <button className={`tab-btn ${tab === 'assets' ? 'active' : ''}`} onClick={() => setTab('assets')}>
                    My Assets
                </button>
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
                    My Requests
                </button>
                <button className={`tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
                    Request Asset
                </button>
            </nav>

            {/* ── content ── */}
            <main className="dashboard-content">
                {/* ─── My Assets tab ─── */}
                {tab === 'assets' && (
                    <section className="card">
                        <h2 className="card-title">My Assigned Assets</h2>
                        {myAssets.length === 0 ? (
                            <p className="empty-state">You have no assigned assets.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myAssets.map((asset) => {
                                            /* find the APPROVED request for this asset so we can return it */
                                            const approvedReq = myRequests.find(
                                                (r) => r.asset?._id === asset._id && r.status === 'APPROVED'
                                            );
                                            return (
                                                <tr key={asset._id}>
                                                    <td>{asset.name}</td>
                                                    <td>{asset.type}</td>
                                                    <td>{statusBadge(asset.status)}</td>
                                                    <td>
                                                        {approvedReq ? (
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                disabled={actionLoading === approvedReq._id}
                                                                onClick={() => handleReturn(approvedReq._id)}
                                                            >
                                                                {actionLoading === approvedReq._id ? 'Returning…' : 'Return'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── My Requests tab ─── */}
                {tab === 'requests' && (
                    <section className="card">
                        <h2 className="card-title">My Requests</h2>
                        {myRequests.length === 0 ? (
                            <p className="empty-state">You haven't made any requests yet.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Asset</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td>{req.asset?.name || 'N/A'}</td>
                                                <td>{req.asset?.type || '—'}</td>
                                                <td>{statusBadge(req.status)}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── Request Asset tab ─── */}
                {tab === 'new' && (
                    <section className="card">
                        <h2 className="card-title">Request an Asset</h2>
                        <p className="card-desc">Enter the Asset ID you want to request. Ask your administrator for available Asset IDs.</p>
                        <form onSubmit={handleRequestAsset} className="inline-form">
                            <input
                                type="text"
                                placeholder="Paste Asset ID here"
                                value={assetId}
                                onChange={(e) => setAssetId(e.target.value)}
                                required
                            />
                            <button className="btn btn-primary" type="submit" disabled={requestLoading}>
                                {requestLoading ? 'Requesting…' : 'Submit Request'}
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </div>
    );
}
