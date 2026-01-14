import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Swal from 'sweetalert2';
import PartnerNavigationMap from '../../components/partner/PartnerNavigationMap';
import './PartnerDeliveries.css';

const PartnerDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showNavigationMap, setShowNavigationMap] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [expandedCards, setExpandedCards] = useState({}); // Track expanded cards

    const toggleCardExpand = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('partnerToken');
            const response = await axios.get('/partner/deliveries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('partnerToken');

            await axios.post('/delivery/accept', {
                deliveryId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Delivery Accepted!',
                text: 'Timer has started. Pick up the order from the store.',
                confirmButtonColor: '#10b981'
            });
            fetchDeliveries();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to accept delivery', 'error');
        }
    };

    const handlePickupOrder = async (deliveryId) => {
        try {
            const token = localStorage.getItem('partnerToken');
            const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));

            await axios.post('/delivery/update-status', {
                deliveryId,
                status: 'picked_up',
                partnerId: partnerInfo._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Order Picked Up!',
                text: 'Now navigate to customer location.',
                confirmButtonColor: '#10b981'
            });
            fetchDeliveries();
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const handleStartDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('partnerToken');
            const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));

            await axios.post('/delivery/update-status', {
                deliveryId,
                status: 'in_transit',
                partnerId: partnerInfo._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Delivery Started!',
                text: 'Navigate to customer location.',
                confirmButtonColor: '#10b981'
            });
            fetchDeliveries();
        } catch (error) {
            Swal.fire('Error', 'Failed to start delivery', 'error');
        }
    };

    const handleCompleteDelivery = async (delivery) => {
        const { value: otp } = await Swal.fire({
            title: 'Enter OTP',
            input: 'text',
            inputLabel: 'Customer OTP',
            inputPlaceholder: 'Enter 4-digit OTP',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            inputValidator: (value) => {
                if (!value) return 'Please enter OTP';
                if (value.length !== 4) return 'OTP must be 4 digits';
            }
        });

        if (otp) {
            try {
                const token = localStorage.getItem('partnerToken');
                const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));

                await axios.post('/delivery/complete', {
                    deliveryId: delivery._id,
                    otp,
                    partnerId: partnerInfo._id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Success!', 'Delivery completed successfully!', 'success');
                fetchDeliveries();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Invalid OTP or delivery completion failed', 'error');
            }
        }
    };

    const getNavigationLink = (address) => {
        const query = encodeURIComponent(address);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    const handleOpenNavigationMap = (delivery) => {
        setSelectedDelivery(delivery);
        setShowNavigationMap(true);
    };

    const handleCloseNavigationMap = () => {
        setShowNavigationMap(false);
        setSelectedDelivery(null);
    };

    const handleRaiseCancellation = async (delivery) => {
        const { value: reason } = await Swal.fire({
            title: 'Raise Cancellation Request',
            input: 'textarea',
            inputLabel: 'Reason for Cancellation',
            inputPlaceholder: 'Please explain why this order should be cancelled (e.g., fake address, customer unreachable, wrong information)...',
            inputAttributes: {
                'aria-label': 'Cancellation reason'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            confirmButtonColor: '#dc3545',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Please provide a detailed reason (at least 10 characters)';
                }
            }
        });

        if (reason) {
            try {
                const token = localStorage.getItem('partnerToken');
                const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));

                await axios.post('/delivery/raise-cancellation', {
                    deliveryId: delivery._id,
                    orderId: delivery.order?._id,
                    partnerId: partnerInfo._id,
                    partnerName: partnerInfo.name,
                    reason: reason.trim()
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Request Submitted',
                    text: 'Your cancellation request has been sent to admin for review. You will be notified of the decision.',
                    confirmButtonColor: '#10b981'
                });
                fetchDeliveries();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to submit cancellation request', 'error');
            }
        }
    };

    const filteredDeliveries = deliveries.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'active') {
            return ['accepted', 'picked_up', 'in_transit'].includes(d.status);
        }
        return d.status === filter;
    });

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading deliveries...</span>
            </div>
        );
    }

    return (
        <div className="partner-deliveries">
            <div className="deliveries-header">
                <div className="header-content">
                    <h1>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        My Deliveries
                    </h1>
                    <p>Manage your assigned deliveries</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                        <span>{deliveries.length} Total</span>
                    </div>
                </div>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    All ({deliveries.length})
                </button>
                <button
                    className={`filter-tab ${filter === 'pending_acceptance' ? 'active' : ''}`}
                    onClick={() => setFilter('pending_acceptance')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Pending ({deliveries.filter(d => d.status === 'pending_acceptance').length})
                </button>
                <button
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 17h4V5H2v12h3" />
                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                        <circle cx="7.5" cy="17.5" r="2.5" />
                        <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                    Active ({deliveries.filter(d => ['accepted', 'picked_up', 'in_transit'].includes(d.status)).length})
                </button>
                <button
                    className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
                    onClick={() => setFilter('delivered')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Completed ({deliveries.filter(d => d.status === 'delivered').length})
                </button>
            </div>

            <div className="deliveries-list">
                {filteredDeliveries.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                        </div>
                        <h3>No Deliveries</h3>
                        <p>You don't have any deliveries in this category yet.</p>
                    </div>
                ) : (
                    filteredDeliveries.map(delivery => (
                        <div key={delivery._id} className={`delivery-card ${expandedCards[delivery._id] ? 'expanded' : 'compact'}`}>
                            {/* Compact Header - Always Visible */}
                            <div
                                className="delivery-compact-header"
                                onClick={() => toggleCardExpand(delivery._id)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: expandedCards[delivery._id] ? '0 0 12px 0' : '0',
                                    borderBottom: expandedCards[delivery._id] ? '1px solid rgba(100,116,139,0.2)' : 'none',
                                    marginBottom: expandedCards[delivery._id] ? '12px' : '0'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div className="order-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-color)' }}>
                                                #{delivery.order?._id?.slice(-6)}
                                            </span>
                                            <span className={`status-badge ${delivery.status}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                {delivery.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            {delivery.order?.userId?.name} • <span style={{ color: '#10b981', fontWeight: '600' }}>₹{delivery.order?.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        {delivery.estimatedTime}m
                                    </span>
                                    <svg
                                        width="18" height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        style={{
                                            transition: 'transform 0.2s',
                                            transform: expandedCards[delivery._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedCards[delivery._id] && (
                                <>
                                    <div className="delivery-details">
                                        <div className="detail-row">
                                            <div className="detail-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                            </div>
                                            <span className="label">Phone</span>
                                            <span className="value">{delivery.order?.userId?.phone}</span>
                                        </div>
                                        <div className="detail-row">
                                            <div className="detail-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                            </div>
                                            <span className="label">Address</span>
                                            <span className="value">{delivery.deliveryLocation?.address}</span>
                                        </div>
                                        {delivery.otp && ['accepted', 'picked_up', 'in_transit'].includes(delivery.status) && (
                                            <div className="detail-row otp-row">
                                                <div className="detail-icon">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                </div>
                                                <span className="label">OTP</span>
                                                <span className="value otp">{delivery.otp}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="delivery-actions">
                                        {delivery.status === 'pending_acceptance' && (
                                            <button className="action-btn primary" onClick={() => handleAcceptDelivery(delivery._id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Accept
                                            </button>
                                        )}
                                        {delivery.status === 'accepted' && (
                                            <button className="action-btn success" onClick={() => handlePickupOrder(delivery._id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                </svg>
                                                Pick Up
                                            </button>
                                        )}
                                        {delivery.status === 'picked_up' && (
                                            <button className="action-btn success" onClick={() => handleStartDelivery(delivery._id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polygon points="10 8 16 12 10 16 10 8" />
                                                </svg>
                                                Start Delivery
                                            </button>
                                        )}
                                        {delivery.status === 'in_transit' && (
                                            <>
                                                <button className="action-btn complete" onClick={() => handleCompleteDelivery(delivery)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    Complete
                                                </button>
                                                <button className="action-btn secondary" onClick={() => handleOpenNavigationMap(delivery)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                                    </svg>
                                                    Navigate
                                                </button>
                                                <button className="action-btn danger" onClick={() => handleRaiseCancellation(delivery)} style={{ flex: 'none', padding: '10px 12px' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        {delivery.status === 'delivered' && (
                                            <div className="completed-badge">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                                Delivered
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Navigation Map Modal */}
            {showNavigationMap && selectedDelivery && (
                <PartnerNavigationMap
                    delivery={selectedDelivery}
                    onClose={handleCloseNavigationMap}
                />
            )}
        </div>
    );
};

export default PartnerDeliveries;
