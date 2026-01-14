import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axios';
import Swal from 'sweetalert2';
import RouteConfigModal from '../../components/admin/RouteConfigModal.jsx';
import useTrackingStatus from '../../hooks/useTrackingStatus.js';
import ViewOnlyBanner from '../../components/admin/ViewOnlyBanner';
import { io } from 'socket.io-client';
import { canEdit, isViewOnly } from '../../utils/adminPermissions';

const ManageOrdersContainer = styled.div``;

const Section = styled.section`
  background: var(--card-bg);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 6px var(--shadow);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-light);
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px 15px;
    background-color: var(--nav-link-hover);
    color: var(--text-color);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
  }

  td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-color);
  }

  tr:hover {
    background-color: var(--nav-link-hover);
  }
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;

  &.view {
    background-color: var(--info-bg);
    color: var(--info-text);

    &:hover {
      background-color: var(--info-bg);
    }
  }

  &.track {
    background-color: #667eea;
    color: white;

    &:hover {
      background-color: #5568d3;
    }
  }

  &.delete {
    background-color: var(--btn-danger);
    color: white;

    &:hover {
      background-color: var(--btn-danger-hover);
    }
  }
`;

const StatusSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-color);
  color: var(--text-color);
`;

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showRouteConfigModal, setShowRouteConfigModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationSimulator, setLocationSimulator] = useState({ lat: '', lng: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const { trackingEnabled } = useTrackingStatus();

  // Partner search state for broadcast assignment
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState([]);
  const [searchingPartners, setSearchingPartners] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalOrder, setAssignModalOrder] = useState(null);

  // Permission check - check for manage_orders permission
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const viewOnly = isViewOnly(admin) || !canEdit(admin, 'orders');

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const orderId = order._id?.toLowerCase() || '';
    const customerName = order.userId?.name?.toLowerCase() || '';
    const customerPhone = order.userId?.phone?.toLowerCase() || '';
    const customerEmail = order.userId?.email?.toLowerCase() || '';
    return orderId.includes(query) ||
      customerName.includes(query) ||
      customerPhone.includes(query) ||
      customerEmail.includes(query);
  });

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  // Real-time order updates via Socket.io
  useEffect(() => {
    const socket = io(window.location.origin.replace(':5174', ':5000'), {
      transports: ['websocket', 'polling']
    });

    // Join admin room
    socket.emit('authenticate', localStorage.getItem('adminToken'));
    socket.on('authenticated', () => {
      socket.emit('join-admin-room');
    });

    // Listen for new orders
    socket.on('new_order', (data) => {
      console.log('📦 New order received:', data.order);
      // Add new order to the top of the list
      setOrders(prevOrders => [data.order, ...prevOrders]);

      // Show notification
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'New Order Received!',
        text: `Order #${data.order._id?.slice(-6)} - ₹${data.order.totalAmount}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    });

    // Listen for order status changes (e.g., delivered)
    socket.on('order_status_changed', (data) => {
      console.log('📝 Order status changed:', data);
      // Update order status in the list
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );

      // Show notification for delivered orders
      if (data.status === 'delivered') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Order Delivered!',
          text: `Order #${data.orderId?.slice(-6)} has been delivered`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch orders'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Fetch only available (online, approved, active) partners
      const response = await axios.get('/admin/available-partners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching available partners:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        message: `Order ${newStatus}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Order status updated successfully'
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status'
      });
    }
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    if (!partnerId) return;

    try {
      const token = localStorage.getItem('adminToken');
      // Use the delivery assign endpoint
      const response = await axios.post('/admin/delivery/assign',
        { orderId, partnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Partner Assigned',
        text: 'Delivery partner assigned. Waiting for partner to accept.',
        html: `<p>Delivery partner assigned successfully!</p>
               <p style="margin-top: 10px; font-size: 14px; color: #666;">
                 Waiting for partner to accept the delivery.
               </p>`,
        timer: 3000
      });

      fetchOrders();
      fetchPartners(); // Refresh partners list
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Assignment Failed',
        text: error.response?.data?.message || 'Failed to assign partner. Make sure order is packed first.'
      });
    }
  };

  // Broadcast order to ALL online partners
  const handleBroadcastOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/admin/delivery/broadcast',
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: '📡 Order Broadcasted!',
        html: `<p>Order sent to <strong>${response.data.onlinePartnersCount}</strong> online partner(s)</p>
               <p style="margin-top: 10px; font-size: 14px; color: #666;">
                 First partner to accept will get the order.
               </p>`,
        timer: 4000
      });

      fetchOrders();
      closeAssignModal();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Broadcast Failed',
        text: error.response?.data?.message || 'Failed to broadcast order. Make sure order is packed first.'
      });
    }
  };

  // Search partners by ID, vehicle, or phone
  const handleSearchPartner = async (query) => {
    setPartnerSearchQuery(query);
    if (query.trim().length < 2) {
      setPartnerSearchResults([]);
      return;
    }

    setSearchingPartners(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/admin/partners/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartnerSearchResults(response.data);
    } catch (error) {
      console.error('Partner search error:', error);
      setPartnerSearchResults([]);
    } finally {
      setSearchingPartners(false);
    }
  };

  // Open assign modal with options
  const openAssignModal = (order) => {
    setAssignModalOrder(order);
    setShowAssignModal(true);
    setPartnerSearchQuery('');
    setPartnerSearchResults([]);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignModalOrder(null);
    setPartnerSearchQuery('');
    setPartnerSearchResults([]);
  };

  const handleUpdateLocation = async () => {
    if (!locationSimulator.lat || !locationSimulator.lng) {
      Swal.fire('Error', 'Please enter both latitude and longitude', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/admin/orders/${selectedOrder._id}/location`, {
        lat: parseFloat(locationSimulator.lat),
        lng: parseFloat(locationSimulator.lng)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Location updated successfully'
      });

      setLocationSimulator({ lat: '', lng: '' });
      fetchOrders();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update location'
      });
    }
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const openRouteConfigModal = (order) => {
    setSelectedOrder(order);
    setShowRouteConfigModal(true);
  };

  const handleRouteSet = () => {
    fetchOrders(); // Refresh orders after route is set
  };

  const handleDelete = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--btn-danger)',
      cancelButtonColor: 'var(--btn-secondary)',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`/admin/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Order deleted successfully'
        });

        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete order'
        });
      }
    }
  };

  const getStatusOptions = (currentStatus) => {
    // Base statuses that admins can set manually
    const baseStatuses = ['pending', 'confirmed', 'packed', 'cancelled'];

    // Delivery statuses only visible after order is packed
    const deliveryStatuses = ['out_for_delivery', 'delivered'];

    if (currentStatus === 'delivered') return ['delivered'];
    if (currentStatus === 'cancelled') return ['cancelled'];
    if (currentStatus === 'out_for_delivery') return ['out_for_delivery', 'delivered', 'cancelled'];
    if (currentStatus === 'packed') return [...baseStatuses, ...deliveryStatuses];
    if (currentStatus === 'confirmed') return ['confirmed', 'packed', 'cancelled'];
    if (currentStatus === 'pending') return ['pending', 'confirmed', 'packed', 'cancelled'];

    return baseStatuses;
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <ManageOrdersContainer>
      {viewOnly && <ViewOnlyBanner role={admin?.role} />}
      <Section>
        <SectionTitle>All Orders</SectionTitle>

        {/* Search Bar */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '250px',
            maxWidth: '400px'
          }}>
            <svg
              width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 42px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          {searchQuery && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Found {filteredOrders.length} of {orders.length} orders
            </span>
          )}
        </div>

        <OrdersTable>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Partner</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8)}</td>
                <td>{order.userId?.name || 'Unknown'}</td>
                <td>{order.items?.length || 0} items</td>
                <td>₹{order.totalAmount?.toLocaleString() || 0}</td>
                <td>
                  <StatusSelect
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={viewOnly}
                    style={viewOnly ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    {getStatusOptions(order.status).map(status => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </StatusSelect>
                </td>
                <td>
                  {order.deliveryPartner?.name ? (
                    <span style={{ fontSize: '12px', color: 'var(--btn-primary)' }}>
                      {order.deliveryPartner.name}
                    </span>
                  ) : order.status === 'packed' ? (
                    <ActionButton
                      className="view"
                      onClick={() => openAssignModal(order)}
                      disabled={viewOnly}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        ...(viewOnly ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                      }}
                    >
                      📡 Assign
                    </ActionButton>
                  ) : order.status === 'broadcasting' ? (
                    <span style={{
                      fontSize: '11px',
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ animation: 'pulse 1s infinite' }}>📡</span> Broadcasting...
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {order.status === 'pending' || order.status === 'confirmed'
                        ? 'Pack first'
                        : order.status === 'out_for_delivery' || order.status === 'assigned'
                          ? 'In delivery'
                          : '-'}
                    </span>
                  )}
                </td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                  {trackingEnabled && !viewOnly && (
                    <ActionButton className="track" onClick={() => openRouteConfigModal(order)}>
                      🗺️ Route
                    </ActionButton>
                  )}
                  {trackingEnabled && !viewOnly && (
                    <ActionButton className="track" onClick={() => openTrackingModal(order)}>
                      Track
                    </ActionButton>
                  )}
                  {!viewOnly && (
                    <ActionButton className="delete" onClick={() => handleDelete(order._id)}>
                      Delete
                    </ActionButton>
                  )}
                  {viewOnly && <span style={{ color: 'var(--text-secondary)' }}>View Only</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </OrdersTable>
      </Section>

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowTrackingModal(false)}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text-color)', marginBottom: '20px' }}>
              Order Tracking Controls
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ color: 'var(--text-color)' }}>Order ID:</strong> #{selectedOrder._id.slice(-8)}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ color: 'var(--text-color)' }}>Current Status:</strong>{' '}
              <span style={{
                padding: '4px 12px',
                background: 'var(--btn-primary)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {selectedOrder.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            {selectedOrder.deliveryPartner && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: 'var(--text-color)' }}>Delivery Partner:</strong>{' '}
                  {selectedOrder.deliveryPartner.name}
                </div>

                <div style={{
                  background: 'var(--bg-color)',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'var(--text-color)', marginBottom: '15px' }}>
                    Location Simulator
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
                    Simulate delivery partner location for testing
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', fontSize: '14px' }}>
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={locationSimulator.lat}
                        onChange={(e) => setLocationSimulator({ ...locationSimulator, lat: e.target.value })}
                        placeholder="19.0760"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          background: 'var(--card-bg)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', fontSize: '14px' }}>
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={locationSimulator.lng}
                        onChange={(e) => setLocationSimulator({ ...locationSimulator, lng: e.target.value })}
                        placeholder="72.8777"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          background: 'var(--card-bg)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateLocation}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--btn-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Update Location
                  </button>

                  {selectedOrder.deliveryPartner.currentLocation && (
                    <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>Current Location:</strong><br />
                      Lat: {selectedOrder.deliveryPartner.currentLocation.lat?.toFixed(6)}<br />
                      Lng: {selectedOrder.deliveryPartner.currentLocation.lng?.toFixed(6)}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setShowTrackingModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Route Configuration Modal */}
      {showRouteConfigModal && selectedOrder && (
        <RouteConfigModal
          order={selectedOrder}
          onClose={() => setShowRouteConfigModal(false)}
          onRouteSet={handleRouteSet}
        />
      )}

      {/* Partner Assignment Modal */}
      {showAssignModal && assignModalOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeAssignModal}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '95%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text-color)', marginBottom: '8px', fontSize: '18px' }}>
              📦 Assign Order #{assignModalOrder._id.slice(-6).toUpperCase()}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              {assignModalOrder.userId?.name} • ₹{assignModalOrder.totalAmount?.toLocaleString()}
            </p>

            {/* Option 1: Broadcast to All */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '8px', fontSize: '14px' }}>
                📡 Broadcast to All Partners
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                Send to all {partners.length} online partners. First to accept gets the order.
              </p>
              <button
                onClick={() => handleBroadcastOrder(assignModalOrder._id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                📡 Broadcast Order
              </button>
            </div>

            {/* Option 2: Search Specific Partner */}
            <div style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '8px', fontSize: '14px' }}>
                🔍 Assign to Specific Partner
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                Search by Partner ID, Vehicle No, Phone, or Name
              </p>
              <input
                type="text"
                placeholder="Type to search... (e.g., DP-XXXX, MH01AB1234)"
                value={partnerSearchQuery}
                onChange={(e) => handleSearchPartner(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              />

              {/* Search Results */}
              {searchingPartners && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>
                  Searching...
                </div>
              )}

              {partnerSearchResults.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {partnerSearchResults.map(partner => (
                    <div
                      key={partner._id}
                      onClick={() => {
                        handleAssignPartner(assignModalOrder._id, partner._id);
                        closeAssignModal();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--nav-link-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-color)' }}>
                          {partner.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {partner.partnerId} • {partner.vehicle?.number || partner.phone}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: partner.status?.includes('Online')
                          ? 'rgba(16, 185, 129, 0.2)'
                          : partner.status?.includes('Handling')
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color: partner.status?.includes('Online')
                          ? '#10b981'
                          : partner.status?.includes('Handling')
                            ? '#f59e0b'
                            : '#ef4444'
                      }}>
                        {partner.status || (partner.isAvailable ? 'Online' : 'Offline')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {partnerSearchQuery.length >= 2 && partnerSearchResults.length === 0 && !searchingPartners && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  No partners found
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={closeAssignModal}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '16px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </ManageOrdersContainer>
  );
};

export default ManageOrders;