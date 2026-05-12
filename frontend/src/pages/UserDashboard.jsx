import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

export default function UserDashboard() {
    const { logout } = useAuth();

    /* ──────────── state ──────────── */
    const [myRequests, setMyRequests] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [tab, setTab] = useState('assets');
    const [reqQtys, setReqQtys] = useState({}); // { assetId: quantity }
    const [returnQtys, setReturnQtys] = useState({}); // { requestId: quantity }

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [requestLoading, setRequestLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    /* ──────────── fetch helpers ──────────── */

    const fetchMyRequests = useCallback(async () => {
        try {
            const res = await API.get('/api/requests/my');
            setMyRequests(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchAvailableAssets = useCallback(async () => {
        try {
            const res = await API.get('/api/assets/list');
            setAvailableAssets(res.data);
        } catch { /* silent */ }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchMyRequests(), fetchAvailableAssets()]);
        setLoading(false);
    }, [fetchMyRequests, fetchAvailableAssets]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ──────────── actions ──────────── */
    const handleRequestAsset = async (id) => {
        const qty = reqQtys[id] || 1;
        setRequestLoading(id);
        setMsg({ text: '', type: '' });
        try {
            await API.post('/api/requests', { assetId: id, requestedQuantity: parseInt(qty) });
            setMsg({ text: 'Asset requested successfully!', type: 'success' });
            fetchAll();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to request asset', type: 'error' });
        } finally {
            setRequestLoading(false);
        }
    };

    const handleReturn = async (requestId) => {
        const qty = returnQtys[requestId] || 1;
        setActionLoading(requestId);
        try {
            await API.patch(`/api/requests/return/${requestId}`, { returnedQty: parseInt(qty) });
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
                        {myRequests.filter(r => r.status === 'APPROVED' && r.remainingAssignedQuantity > 0).length === 0 ? (
                            <p className="empty-state">You have no assigned assets.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Remaining</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRequests
                                            .filter(r => r.status === 'APPROVED' && r.remainingAssignedQuantity > 0)
                                            .map((req) => (
                                                <tr key={req._id}>
                                                    <td>{req.asset?.name || 'N/A'}</td>
                                                    <td>{req.asset?.type || '—'}</td>
                                                    <td>
                                                        <span className="badge badge-qty">{req.remainingAssignedQuantity}</span>
                                                    </td>
                                                    <td>
                                                        <div className="return-action-group">
                                                            <div className="qty-input-group">
                                                                <input 
                                                                    type="number" 
                                                                    min="1" 
                                                                    max={req.remainingAssignedQuantity}
                                                                    value={returnQtys[req._id] || req.remainingAssignedQuantity}
                                                                    onChange={(e) => setReturnQtys({...returnQtys, [req._id]: e.target.value})}
                                                                    className="qty-input-sm"
                                                                />
                                                                <button
                                                                    className="btn btn-warning btn-sm"
                                                                    disabled={actionLoading === req._id}
                                                                    onClick={() => handleReturn(req._id)}
                                                                >
                                                                    {actionLoading === req._id ? '…' : 'Return'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
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
                                            <th>Qty</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td>{req.asset?.name || 'N/A'}</td>
                                                <td>{req.asset?.type || '—'}</td>
                                                <td><span className="badge badge-qty">{req.requestedQuantity}</span></td>
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
                        <div className="card-header-flex">
                            <div>
                                <h2 className="card-title">Available Assets</h2>
                                <p className="card-desc">Select an asset from the list below to submit a request.</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={fetchAvailableAssets}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {availableAssets.length === 0 ? (
                            <p className="empty-state">No assets found.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Asset Name</th>
                                            <th>Type</th>
                                            <th>Available Stock</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableAssets.map((asset) => {
                                            const isAvailable = asset.status === 'AVAILABLE';
                                            const hasPendingRequest = myRequests.some(r => r.asset?._id === asset._id && r.status === 'PENDING');

                                            return (
                                                <tr key={asset._id}>
                                                    <td>
                                                        <div className="asset-info-cell">
                                                            <span className="asset-name-main">{asset.name}</span>
                                                            <span className="asset-id-sub">{asset._id}</span>
                                                        </div>
                                                    </td>
                                                    <td>{asset.type}</td>
                                                    <td>
                                                        <div className="stock-info">
                                                            <span className={`stock-count ${asset.availableQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                                {asset.availableQuantity} units
                                                            </span>
                                                            <span className="stock-label">left</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="request-action-group">
                                                            {hasPendingRequest ? (
                                                                <span className="status-label warning">Request Pending</span>
                                                            ) : isAvailable ? (
                                                                <>
                                                                    <div className="qty-input-group">
                                                                        <label className="sr-only">Quantity</label>
                                                                        <input 
                                                                            type="number" 
                                                                            min="1" 
                                                                            max={asset.availableQuantity}
                                                                            value={reqQtys[asset._id] || 1}
                                                                            onChange={(e) => setReqQtys({...reqQtys, [asset._id]: e.target.value})}
                                                                            className="qty-input-sm"
                                                                        />
                                                                        <button
                                                                            className="btn btn-primary btn-sm"
                                                                            disabled={requestLoading === asset._id || (reqQtys[asset._id] || 1) > asset.availableQuantity}
                                                                            onClick={() => handleRequestAsset(asset._id)}
                                                                        >
                                                                            {requestLoading === asset._id ? '…' : 'Request'}
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className="status-label danger">Out of Stock</span>
                                                            )}
                                                        </div>
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
            </main>
        </div>
    );
}
