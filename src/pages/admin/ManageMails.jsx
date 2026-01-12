import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Swal from 'sweetalert2';
import './ManageAdmins.css';
import ViewOnlyBanner from '../../components/admin/ViewOnlyBanner';

// Check if admin is viewer (read-only)
const isViewOnly = (admin) => {
    return admin?.role === 'normal_viewer' || admin?.role === 'special_viewer';
};

const ManageMails = () => {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Viewer restriction
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const viewOnly = isViewOnly(admin);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [deliveryType, setDeliveryType] = useState('app'); // 'app', 'email', 'both'

    // Broadcast form state
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

    useEffect(() => {
        fetchMails();
    }, []);

    const fetchMails = async () => {
        try {
            const response = await axios.get('/admin/mails', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setMails(response.data);
        } catch (error) {
            console.error('Failed to fetch mails:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 1) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            const response = await axios.get(`/admin/users/search?q=${query}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setSearchResults(response.data);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setSearchQuery(user.name);
        setShowSearchResults(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            Swal.fire('Error', 'Please select a user to send mail to', 'error');
            return;
        }

        if (!subject.trim() || !message.trim()) {
            Swal.fire('Error', 'Subject and message are required', 'error');
            return;
        }

        setSending(true);
        try {
            await axios.post('/admin/mails', {
                userId: selectedUser._id,
                subject: subject.trim(),
                message: message.trim(),
                deliveryType: deliveryType
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });

            const deliveryMessage = deliveryType === 'app' 
                ? `Mail sent to ${selectedUser.name}'s ExpressBasket inbox`
                : deliveryType === 'email'
                ? `Email sent to ${selectedUser.email}`
                : `Mail sent to ${selectedUser.name}'s inbox and email`;
            
            Swal.fire('Success', deliveryMessage, 'success');

            // Reset form
            setSelectedUser(null);
            setSearchQuery('');
            setSubject('');
            setMessage('');
            setDeliveryType('app');

            // Refresh mails list
            fetchMails();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send mail', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();

        if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
            Swal.fire('Error', 'Subject and message are required', 'error');
            return;
        }

        // Confirmation dialog
        const result = await Swal.fire({
            title: 'Broadcast to All Users?',
            html: `
                <p>You are about to send this message to <strong>ALL users</strong>.</p>
                <p><strong>Subject:</strong> ${broadcastSubject}</p>
                <p>This action cannot be undone.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Send Broadcast',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setBroadcasting(true);
        try {
            const response = await axios.post('/admin/mails/broadcast', {
                subject: broadcastSubject.trim(),
                message: broadcastMessage.trim()
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });

            Swal.fire({
                title: 'Broadcast Sent!',
                html: `
                    <p>✅ Message successfully sent to <strong>${response.data.count} users</strong></p>
                    <p><strong>Subject:</strong> ${response.data.subject}</p>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 14px; color: #666;">
                        📧 <strong>Emails:</strong> ${response.data.emailStats.sent} sent, ${response.data.emailStats.failed} failed
                    </p>
                `,
                icon: 'success'
            });

            // Reset form
            setBroadcastSubject('');
            setBroadcastMessage('');

            // Refresh mails list
            fetchMails();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send broadcast', 'error');
        } finally {
            setBroadcasting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading mails...</div>;

    return (
        <div className="manage-admins">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Mail Center
            </h1>

            {viewOnly && <ViewOnlyBanner role={admin?.role} />}

            {/* Broadcast and Compose sections - hidden for viewers */}
            {!viewOnly && (
                <>
                    {/* Broadcast Section */}
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        padding: '25px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px var(--shadow)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--text-color)',
                            fontSize: '20px'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2">
                                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            Broadcast to All Users
                        </h3>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            Send system-generated messages to all users simultaneously. This action cannot be undone.
                        </p>

                        <form onSubmit={handleBroadcast}>
                            {/* Broadcast Subject */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter broadcast subject..."
                                    value={broadcastSubject}
                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '15px',
                                        fontWeight: '500'
                                    }}
                                />
                            </div>

                            {/* Broadcast Message */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}>
                                    Message
                                </label>
                                <textarea
                                    placeholder="Write your broadcast message here..."
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '15px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Broadcast Button */}
                            <button
                                type="submit"
                                disabled={broadcasting || !broadcastSubject.trim() || !broadcastMessage.trim()}
                                style={{
                                    padding: '14px 30px',
                                    background: 'var(--btn-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: (broadcasting || !broadcastSubject.trim() || !broadcastMessage.trim()) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease',
                                    opacity: (broadcasting || !broadcastSubject.trim() || !broadcastMessage.trim()) ? 0.6 : 1
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 0 0 1 14 0v5a3 0 0 0 3 3zm-8.27 4a2 0 0 1-3.46 0"></path>
                                </svg>
                                {broadcasting ? 'Broadcasting...' : 'Send Broadcast to All Users'}
                            </button>
                        </form>
                    </div>

                    {/* Compose Mail Section */}
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        padding: '25px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px var(--shadow)'
                    }}>
                        <h3 style={{
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--text-color)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Compose New Mail
                        </h3>

                        <form onSubmit={handleSend}>
                            {/* Recipient Search */}
                            <div style={{ marginBottom: '20px', position: 'relative' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    To (Search User)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            paddingLeft: '45px',
                                            borderRadius: '10px',
                                            border: selectedUser ? '2px solid var(--btn-primary)' : '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-color)',
                                            fontSize: '15px'
                                        }}
                                    />
                                    <svg
                                        style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    {selectedUser && (
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'var(--btn-danger)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    )}

                                    {/* Search Results Dropdown */}
                                    {showSearchResults && searchResults.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '10px',
                                            marginTop: '5px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                            zIndex: 100,
                                            maxHeight: '250px',
                                            overflowY: 'auto'
                                        }}>
                                            {searchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    onClick={() => selectUser(user)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom: '1px solid var(--border-color)',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'var(--nav-link-hover)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                >
                                                    <p style={{ fontWeight: '600', color: 'var(--text-color)', margin: 0 }}>{user.name}</p>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                                        {user.email} {user.phone && `• ${user.phone}`}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedUser && (
                                    <p style={{ marginTop: '8px', color: 'var(--btn-primary)', fontSize: '13px' }}>
                                        ✓ Selected: {selectedUser.name} ({selectedUser.email})
                                    </p>
                                )}
                            </div>

                            {/* Delivery Type Selector */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Send To
                                </label>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    flexWrap: 'wrap'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 18px',
                                        borderRadius: '10px',
                                        border: deliveryType === 'app' ? '2px solid var(--btn-primary)' : '1px solid var(--border-color)',
                                        background: deliveryType === 'app' ? 'rgba(102, 126, 234, 0.1)' : 'var(--input-bg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value="app"
                                            checked={deliveryType === 'app'}
                                            onChange={(e) => setDeliveryType(e.target.value)}
                                            style={{ display: 'none' }}
                                        />
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={deliveryType === 'app' ? 'var(--btn-primary)' : 'var(--text-secondary)'} strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                        <span style={{ 
                                            color: deliveryType === 'app' ? 'var(--btn-primary)' : 'var(--text-color)',
                                            fontWeight: deliveryType === 'app' ? '600' : '400'
                                        }}>
                                            ExpressBasket Mail
                                        </span>
                                    </label>
                                    
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 18px',
                                        borderRadius: '10px',
                                        border: deliveryType === 'email' ? '2px solid #10b981' : '1px solid var(--border-color)',
                                        background: deliveryType === 'email' ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value="email"
                                            checked={deliveryType === 'email'}
                                            onChange={(e) => setDeliveryType(e.target.value)}
                                            style={{ display: 'none' }}
                                        />
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={deliveryType === 'email' ? '#10b981' : 'var(--text-secondary)'} strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <span style={{ 
                                            color: deliveryType === 'email' ? '#10b981' : 'var(--text-color)',
                                            fontWeight: deliveryType === 'email' ? '600' : '400'
                                        }}>
                                            User Email
                                        </span>
                                    </label>
                                    
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 18px',
                                        borderRadius: '10px',
                                        border: deliveryType === 'both' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                                        background: deliveryType === 'both' ? 'rgba(245, 158, 11, 0.1)' : 'var(--input-bg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value="both"
                                            checked={deliveryType === 'both'}
                                            onChange={(e) => setDeliveryType(e.target.value)}
                                            style={{ display: 'none' }}
                                        />
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={deliveryType === 'both' ? '#f59e0b' : 'var(--text-secondary)'} strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        <span style={{ 
                                            color: deliveryType === 'both' ? '#f59e0b' : 'var(--text-color)',
                                            fontWeight: deliveryType === 'both' ? '600' : '400'
                                        }}>
                                            Both
                                        </span>
                                    </label>
                                </div>
                                <p style={{ 
                                    marginTop: '8px', 
                                    fontSize: '12px', 
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {deliveryType === 'app' && (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                            </svg>
                                            Mail will appear in user's ExpressBasket inbox only
                                        </>
                                    )}
                                    {deliveryType === 'email' && (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            Mail will be sent to user's registered email address only
                                        </>
                                    )}
                                    {deliveryType === 'both' && (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            Mail will be sent to both ExpressBasket inbox and email
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Subject */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter mail subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            {/* Message */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Message
                                </label>
                                <textarea
                                    placeholder="Write your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '15px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={sending || !selectedUser || !subject.trim() || !message.trim()}
                                style={{
                                    padding: '14px 30px',
                                    background: 'var(--btn-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    opacity: (sending || !selectedUser || !subject.trim() || !message.trim()) ? 0.6 : 1
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                {sending ? 'Sending...' : 'Send Mail'}
                            </button>
                        </form>
                    </div>

                </>
            )}

            {/* Sent Mails History - visible to all */}
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 4px 15px var(--shadow)'
            }}>
                <h3 style={{
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-color)'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                    Sent Mails ({mails.length})
                </h3>

                {mails.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                        No mails sent yet. Compose your first mail above!
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>To</th>
                                    <th>Subject</th>
                                    <th>Delivery</th>
                                    <th>Status</th>
                                    <th>Sent At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mails.map(mail => (
                                    <tr key={mail._id}>
                                        <td>
                                            <div>
                                                <p style={{ fontWeight: '600', margin: 0 }}>{mail.to?.name || 'Unknown'}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                                    {mail.to?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td>{mail.subject}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {(mail.deliveryType === 'app' || mail.deliveryType === 'both' || !mail.deliveryType) && (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '3px 8px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        background: 'rgba(102, 126, 234, 0.15)',
                                                        color: 'var(--btn-primary)'
                                                    }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                                        </svg>
                                                        App
                                                    </span>
                                                )}
                                                {(mail.deliveryType === 'email' || mail.deliveryType === 'both') && (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '3px 8px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        background: mail.emailSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                        color: mail.emailSent ? '#10b981' : '#ef4444'
                                                    }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                            <polyline points="22,6 12,13 2,6"></polyline>
                                                        </svg>
                                                        {mail.emailSent ? 'Email Sent' : 'Email Failed'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                background: mail.read ? 'var(--success-bg)' : 'var(--warning-bg)',
                                                color: mail.read ? 'var(--success-text)' : 'var(--warning-text)'
                                            }}>
                                                {mail.read ? 'Read' : 'Unread'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {formatDate(mail.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMails;
