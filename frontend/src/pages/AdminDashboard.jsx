import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

export default function AdminDashboard() {
    const { logout } = useAuth();

    /* ──────────── state ──────────── */
    const [assets, setAssets] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tab, setTab] = useState('assets');

    // add-asset form
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('');

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [addLoading, setAddLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    /* ──────────── fetch helpers ──────────── */
    const fetchAssets = useCallback(async () => {
        try {
            const res = await API.get('/assets');
            setAssets(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await API.get('/requests');
            setRequests(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchAssets(), fetchRequests()]);
        setLoading(false);
    }, [fetchAssets, fetchRequests]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ──────────── actions ──────────── */
    const handleAddAsset = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !newType.trim()) return;
        setAddLoading(true);
        setMsg({ text: '', type: '' });
        try {
            await API.post('/assets', { name: newName.trim(), type: newType.trim() });
            setMsg({ text: 'Asset created successfully!', type: 'success' });
            setNewName('');
            setNewType('');
            fetchAssets();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to create asset', type: 'error' });
        } finally {
            setAddLoading(false);
        }
    };

    const handleStatus = async (requestId, status) => {
        setActionLoading(requestId);
        try {
            await API.patch(`/requests/${requestId}`, { status });
            setMsg({ text: `Request ${status.toLowerCase()} successfully!`, type: 'success' });
            fetchAll();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Action failed', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    /* ──────────── helpers ──────────── */
    const statusBadge = (status) => (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    );

    const copyId = (id) => {
        navigator.clipboard.writeText(id);
        setMsg({ text: `Asset ID copied: ${id}`, type: 'success' });
    };

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
                    <span className="role-chip role-admin">ADMIN</span>
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

            {/* ── stats row ── */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">{assets.length}</span>
                    <span className="stat-label">Total Assets</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{assets.filter(a => a.status === 'AVAILABLE').length}</span>
                    <span className="stat-label">Available</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{assets.filter(a => a.status === 'ASSIGNED').length}</span>
                    <span className="stat-label">Assigned</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{requests.filter(r => r.status === 'PENDING').length}</span>
                    <span className="stat-label">Pending Requests</span>
                </div>
            </div>

            {/* ── tab nav ── */}
            <nav className="tab-nav">
                <button className={`tab-btn ${tab === 'assets' ? 'active' : ''}`} onClick={() => setTab('assets')}>
                    Assets
                </button>
                <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
                    Add Asset
                </button>
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
                    Requests
                </button>
            </nav>

            {/* ── content ── */}
            <main className="dashboard-content">
                {/* ─── Asset list tab ─── */}
                {tab === 'assets' && (
                    <section className="card">
                        <h2 className="card-title">All Assets</h2>
                        {assets.length === 0 ? (
                            <p className="empty-state">No assets yet. Add one from the "Add Asset" tab.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Assigned To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assets.map((asset) => (
                                            <tr key={asset._id}>
                                                <td>
                                                    <div className="id-cell">
                                                        <code className="mono">{asset._id}</code>
                                                        <button className="btn-copy" onClick={() => copyId(asset._id)} title="Copy full ID">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{asset.name}</td>
                                                <td>{asset.type}</td>
                                                <td>{statusBadge(asset.status)}</td>
                                                <td>{asset.assignedTo ? `${asset.assignedTo.name} (${asset.assignedTo.email})` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── Add Asset tab ─── */}
                {tab === 'add' && (
                    <section className="card">
                        <h2 className="card-title">Add New Asset</h2>
                        <form onSubmit={handleAddAsset} className="add-form">
                            <div className="form-group">
                                <label htmlFor="asset-name">Asset Name</label>
                                <input
                                    id="asset-name"
                                    type="text"
                                    placeholder='e.g. MacBook Pro 16"'
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="asset-type">Asset Type</label>
                                <input
                                    id="asset-type"
                                    type="text"
                                    placeholder="e.g. Laptop"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={addLoading}>
                                {addLoading ? 'Creating…' : 'Create Asset'}
                            </button>
                        </form>
                    </section>
                )}

                {/* ─── Requests tab ─── */}
                {tab === 'requests' && (
                    <section className="card">
                        <h2 className="card-title">All Requests</h2>
                        {requests.length === 0 ? (
                            <p className="empty-state">No requests yet.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Asset</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((req) => (
                                            <tr key={req._id}>
                                                <td>{req.user?.name || 'N/A'} <span className="text-muted">({req.user?.email})</span></td>
                                                <td>{req.asset?.name || 'N/A'}</td>
                                                <td>{statusBadge(req.status)}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {req.status === 'PENDING' ? (
                                                        <div className="action-btns">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                disabled={actionLoading === req._id}
                                                                onClick={() => handleStatus(req._id, 'APPROVED')}
                                                            >
                                                                {actionLoading === req._id ? '…' : 'Approve'}
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                disabled={actionLoading === req._id}
                                                                onClick={() => handleStatus(req._id, 'REJECTED')}
                                                            >
                                                                {actionLoading === req._id ? '…' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
