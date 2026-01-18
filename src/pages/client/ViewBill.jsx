import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import './ViewBill.css';

const ViewBill = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const billRef = useRef(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/order/public/${orderId}`);
            setOrder(response.data);
            setError('');
        } catch (err) {
            setError('Order not found or has been removed');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!order) return;

        const billContent = billRef.current.innerHTML;
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order._id?.slice(-6).toUpperCase()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #fff; color: #1a1a2e; }
          .bill-container { max-width: 800px; margin: 0 auto; }
          .bill-header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: flex-start; gap: 10px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #28a745; }
          .company-info { text-align: right; }
          .company-info h1 { font-size: 20px; color: #28a745; margin-bottom: 5px; display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
          .company-info p { color: #4a5568; font-size: 11px; }
          .invoice-info { text-align: center; }
          .invoice-info h2 { font-size: 26px; color: #1a1a2e; margin-bottom: 5px; letter-spacing: 3px; }
          .invoice-info .order-date { color: #4a5568; font-size: 12px; }
          .qr-section { display: flex; flex-direction: column; align-items: flex-start; }
          .qr-section .qr-image { width: 60px; height: 60px; border: 2px solid #28a745; border-radius: 8px; padding: 3px; }
          .qr-section .order-id { font-size: 10px; color: #28a745; font-weight: 700; margin-top: 4px; }
          .customer-info { margin-bottom: 20px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #c3e6cb; }
          .customer-info h3 { font-size: 12px; color: #28a745; margin-bottom: 10px; text-transform: uppercase; font-weight: 700; }
          .customer-info p { font-size: 13px; margin-bottom: 4px; color: #1a1a2e; }
          .customer-info .customer-name { font-weight: 600; font-size: 15px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 12px; overflow: hidden; }
          .items-table th { background: #28a745; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; }
          .items-table th:nth-child(3), .items-table th:nth-child(4), .items-table th:nth-child(5) { text-align: center; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; }
          .items-table td:nth-child(3), .items-table td:nth-child(4), .items-table td:nth-child(5) { text-align: center; }
          .items-table tr:nth-child(even) { background: #f8fafc; }
          .totals-section { margin-left: auto; width: 280px; background: #f8fafc; padding: 15px 20px; border-radius: 12px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #4a5568; }
          .total-row.grand-total { font-weight: 700; font-size: 16px; color: #1a1a2e; border-top: 2px solid #28a745; padding-top: 12px; margin-top: 8px; }
          .total-row.grand-total span:last-child { color: #28a745; }
          .payment-info { margin-top: 20px; padding: 15px 20px; background: #d4edda; border-radius: 12px; display: flex; align-items: center; gap: 12px; color: #155724; font-size: 14px; border: 1px solid #c3e6cb; }
          .bill-footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #e2e8f0; color: #6c757d; font-size: 12px; }
          .bill-footer p:first-child { font-weight: 600; color: #4a5568; margin-bottom: 5px; }
          .status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
          .status-delivered { background: #d4edda; color: #155724; border: 1px solid #28a745; }
          .status-pending { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
          .status-cancelled { background: #f8d7da; color: #721c24; border: 1px solid #dc3545; }
          .item-total { font-weight: 600; color: #28a745; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .items-table th { background: #28a745 !important; color: white !important; } }
        </style>
      </head>
      <body>
        ${billContent}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
        printWindow.document.close();
    };

    const getStatusClass = (status) => {
        if (status === 'delivered') return 'status-delivered';
        if (status === 'cancelled') return 'status-cancelled';
        return 'status-pending';
    };

    if (loading) {
        return (
            <div className="view-bill-container">
                <div className="bill-loading">
                    <div className="invoice-loader">
                        <div className="loader-ring"></div>
                        <div className="loader-ring"></div>
                        <svg className="loader-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div className="loader-text">
                        <span>Loading Invoice</span>
                        <div className="loader-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="view-bill-container">
                <div className="error-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <h2>Invoice Not Found</h2>
                    <p>{error || 'The requested invoice could not be found.'}</p>
                    <Link to="/" className="shop-more-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Shop Now
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const total = order.totalAmount || (subtotal + deliveryCharge);

    // Get user data from populated order
    const user = order.userId;

    return (
        <div className="view-bill-container" data-theme="light">
            {/* Modal-style invoice matching OrderBill component layout */}
            <div className="order-bill-modal">
                {/* Action Buttons Header */}
                <div className="bill-header-bar no-print">
                    <h3 className="header-title">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        Invoice
                    </h3>
                    <div className="header-actions">
                        <button onClick={handlePrint} className="print-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download / Print
                        </button>
                        <Link to="/" className="shop-more-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Shop More
                        </Link>
                    </div>
                </div>

                {/* Bill Content */}
                <div ref={billRef} className="bill-container">
                    {/* Header - Matches modal layout: QR left, INVOICE center, Company right */}
                    <div className="bill-header">
                        {/* QR Code Section - Left */}
                        <div className="qr-section">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.href)}`}
                                alt="Order QR Code"
                                className="qr-image"
                            />
                            <span className="order-id">#{order._id?.slice(-6).toUpperCase()}</span>
                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        {/* Invoice Info - Center */}
                        <div className="invoice-info">
                            <h2>INVOICE</h2>
                            <p className="order-date">
                                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Company Info - Right */}
                        <div className="company-info">
                            <h1>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                Express Basket
                            </h1>
                            <p>Your Trusted Online Grocery Store</p>
                            <p>contact: expressbasket.help@gmail.com</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="customer-info">
                        <h3>BILL TO</h3>
                        <p className="customer-name">{user?.name || 'Customer'}</p>
                        <p>{user?.email}</p>
                        <p>{user?.phone}</p>
                        {order.shippingAddress && (
                            <p className="address">
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                        )}
                    </div>

                    {/* Items Table */}
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ITEM</th>
                                <th>QTY</th>
                                <th>PRICE</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.productId?.name || item.name || 'Product'}</td>
                                    <td>{item.quantity || 1}</td>
                                    <td>₹{(item.price || item.productId?.price || 0).toFixed(2)}</td>
                                    <td className="item-total">₹{((item.price || item.productId?.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Delivery:</span>
                            <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="total-row discount">
                                <span>Discount:</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="total-row grand-total">
                            <span>Grand Total:</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="payment-info">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>
                            Payment: {order.paymentMethod === 'wallet' ? 'Paid via Wallet' : order.paymentMethod === 'friend_wallet' ? "Paid via Friend's Wallet" : 'Cash on Delivery'}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="bill-footer">
                        <p>Thank you for shopping with Express Basket!</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewBill;
