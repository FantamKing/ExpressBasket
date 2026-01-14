import React, { useRef } from 'react';

const OrderBill = ({ order, user, onClose }) => {
    const billRef = useRef(null);

    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        const billContent = billRef.current.innerHTML;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order._id.slice(-6).toUpperCase()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #fff; color: #1a1a2e; }
          .bill-container { max-width: 800px; margin: 0 auto; }
          .bill-header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: flex-start; gap: 10px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #28a745; }
          .company-info { grid-column: 1; }
          .company-info h1 { font-size: 20px; color: #28a745; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
          .company-info p { color: #4a5568; font-size: 11px; }
          .invoice-info { grid-column: 2; text-align: center; }
          .invoice-info h2 { font-size: 26px; color: #28a745; margin-bottom: 5px; letter-spacing: 3px; }
          .invoice-info .order-date { color: #4a5568; font-size: 12px; }
          .qr-section { grid-column: 3; display: flex; flex-direction: column; align-items: flex-end; }
          .qr-section img { width: 60px; height: 60px; border: 2px solid #28a745; border-radius: 8px; padding: 3px; }
          .qr-section .order-id { font-size: 10px; color: #28a745; font-weight: 700; margin-top: 4px; }
          .customer-info { margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 12px; }
          .customer-info h3 { font-size: 12px; color: #28a745; margin-bottom: 10px; text-transform: uppercase; font-weight: 700; }
          .customer-info p { font-size: 13px; margin-bottom: 4px; color: #1a1a2e; }
          .customer-info .customer-name { font-weight: 600; font-size: 15px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 12px; overflow: hidden; }
          .items-table th { background: #28a745; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; }
          .items-table th:nth-child(3), .items-table th:nth-child(4), .items-table th:nth-child(5) { text-align: center; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; }
          .items-table td:nth-child(3), .items-table td:nth-child(4), .items-table td:nth-child(5) { text-align: center; }
          .items-table tr:nth-child(even) { background: #f8fafc; }
          .totals { margin-left: auto; width: 280px; background: #f8fafc; padding: 15px 20px; border-radius: 12px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #4a5568; }
          .totals-row.total { font-weight: 700; font-size: 16px; color: #1a1a2e; border-top: 2px solid #28a745; padding-top: 12px; margin-top: 8px; }
          .totals-row.total span:last-child { color: #28a745; }
          .payment-info { margin-top: 20px; padding: 15px 20px; background: linear-gradient(135deg, #d4edda, #c3e6cb); border-radius: 12px; display: flex; align-items: center; gap: 12px; color: #155724; font-size: 14px; }
          .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #e2e8f0; color: #6c757d; font-size: 12px; }
          .footer p:first-child { font-weight: 600; color: #4a5568; margin-bottom: 5px; }
          .status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
          .status-delivered { background: linear-gradient(135deg, #d4edda, #c3e6cb); color: #155724; border: 1px solid #28a745; }
          .status-pending { background: linear-gradient(135deg, #fff3cd, #ffeeba); color: #856404; border: 1px solid #ffc107; }
          .status-cancelled { background: linear-gradient(135deg, #f8d7da, #f5c6cb); color: #721c24; border: 1px solid #dc3545; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .items-table th { background: #28a745 !important; } }
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

    const subtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const total = order.totalAmount || (subtotal + deliveryCharge);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }} onClick={onClose}>
            {/* FORCE light theme - reset CSS variables and override all colors */}
            <style>
                {`
                    /* Reset CSS variables to light theme inside invoice modal */
                    .order-bill-modal,
                    .order-bill-modal *,
                    [data-theme="dark"] .order-bill-modal,
                    [data-theme="dark"] .order-bill-modal * {
                        --text-color: #1a1a2e !important;
                        --text-secondary: #4a5568 !important;
                        --bg-color: #ffffff !important;
                        --card-bg: #ffffff !important;
                    }
                    
                    /* Force all text inside modal to be dark */
                    .order-bill-modal,
                    .order-bill-modal h1,
                    .order-bill-modal h2,
                    .order-bill-modal h3,
                    .order-bill-modal h4,
                    .order-bill-modal p,
                    .order-bill-modal span,
                    .order-bill-modal div,
                    .order-bill-modal td,
                    .order-bill-modal label,
                    .order-bill-modal strong,
                    [data-theme="dark"] .order-bill-modal,
                    [data-theme="dark"] .order-bill-modal h1,
                    [data-theme="dark"] .order-bill-modal h2,
                    [data-theme="dark"] .order-bill-modal h3,
                    [data-theme="dark"] .order-bill-modal h4,
                    [data-theme="dark"] .order-bill-modal p,
                    [data-theme="dark"] .order-bill-modal span,
                    [data-theme="dark"] .order-bill-modal div,
                    [data-theme="dark"] .order-bill-modal td,
                    [data-theme="dark"] .order-bill-modal label,
                    [data-theme="dark"] .order-bill-modal strong {
                        color: #1a1a2e !important;
                    }
                    
                    /* Bill container white background */
                    .order-bill-modal .bill-container,
                    [data-theme="dark"] .order-bill-modal .bill-container {
                        background: #ffffff !important;
                        color: #1a1a2e !important;
                    }
                    
                    /* Table headers - white text on green */
                    .order-bill-modal table th,
                    [data-theme="dark"] .order-bill-modal table th {
                        color: #ffffff !important;
                        background: #28a745 !important;
                    }
                    
                    /* Keep button text white */
                    .order-bill-modal button,
                    .order-bill-modal button span,
                    [data-theme="dark"] .order-bill-modal button,
                    [data-theme="dark"] .order-bill-modal button span {
                        color: #ffffff !important;
                    }
                    
                    /* Invoice header bar h3 stays green */
                    .order-bill-modal .bill-header-bar h3,
                    .order-bill-modal .bill-header-bar h3 span,
                    [data-theme="dark"] .order-bill-modal .bill-header-bar h3,
                    [data-theme="dark"] .order-bill-modal .bill-header-bar h3 span {
                        color: #28a745 !important;
                    }
                    
                    /* Payment info - dark green text */
                    .order-bill-modal .payment-info,
                    .order-bill-modal .payment-info span,
                    [data-theme="dark"] .order-bill-modal .payment-info,
                    [data-theme="dark"] .order-bill-modal .payment-info span {
                        color: #155724 !important;
                    }
                    
                    /* Totals section */
                    .order-bill-modal .totals,
                    .order-bill-modal .totals span,
                    .order-bill-modal .totals div,
                    [data-theme="dark"] .order-bill-modal .totals,
                    [data-theme="dark"] .order-bill-modal .totals span,
                    [data-theme="dark"] .order-bill-modal .totals div {
                        color: #1a1a2e !important;
                    }
                    
                    /* Company info text */
                    .order-bill-modal .company-info p,
                    [data-theme="dark"] .order-bill-modal .company-info p {
                        color: #1e293b !important;
                    }
                `}
            </style>
            <div className="order-bill-modal" style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)',
                borderRadius: '20px',
                maxWidth: '850px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                color: '#1a1a2e'
            }} onClick={e => e.stopPropagation()}>

                {/* Action Buttons */}
                <div className="bill-header-bar" style={{
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    padding: '15px 25px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10,
                    borderRadius: '20px 20px 0 0'
                }}>
                    <h3 style={{ margin: 0, color: '#28a745', fontSize: '18px', fontWeight: '700' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            Invoice
                        </span>
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download / Print
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #1a1a2e, #2d2d44)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Bill Content */}
                <div ref={billRef} className="bill-container" data-theme="light" style={{
                    padding: '30px 40px',
                    background: 'white',
                    margin: '20px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    color: '#1a1a2e'
                }}>
                    {/* Header */}
                    <div className="bill-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '15px',
                        marginBottom: '25px',
                        paddingBottom: '20px',
                        borderBottom: '3px solid #28a745'
                    }}>
                        {/* Company Info - Left */}
                        <div className="company-info" style={{ minWidth: '180px', maxWidth: '200px' }}>
                            <div style={{ fontSize: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                <span style={{ color: '#28a745' }}>Express Basket</span>
                            </div>
                            <p style={{ color: '#1e293b', fontSize: '11px', marginBottom: '2px', fontWeight: '500' }}>Your Trusted Online Grocery Store</p>
                            <p style={{ color: '#1e293b', fontSize: '11px', fontWeight: '500' }}>contact: expressbasket.help@gmail.com</p>
                        </div>

                        {/* Invoice Info - Center */}
                        <div className="invoice-info" style={{ textAlign: 'center', flex: '1' }}>
                            <div id="invoice-title-black" style={{ fontSize: '26px', marginBottom: '6px', letterSpacing: '3px', fontWeight: '800' }}>INVOICE</div>
                            <p className="order-date" style={{ color: '#1e293b', fontSize: '12px', fontWeight: '500' }}>
                                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* QR & Status - Right */}
                        <div className="qr-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '90px' }}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('https://expressbasket.vercel.app/bill/' + order._id)}`}
                                alt="Order QR Code"
                                style={{ width: '65px', height: '65px', borderRadius: '8px', border: '2px solid #28a745', padding: '2px', background: 'white' }}
                            />
                            <span className="order-id" style={{ fontSize: '10px', color: '#28a745', fontWeight: '700' }}>#{order._id.slice(-6).toUpperCase()}</span>
                            <span className={`status-badge ${getStatusClass(order.status)}`} style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '9px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background: order.status === 'delivered' ? '#d4edda' : order.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                                color: order.status === 'delivered' ? '#155724' : order.status === 'cancelled' ? '#721c24' : '#856404',
                                border: order.status === 'delivered' ? '1px solid #28a745' : order.status === 'cancelled' ? '1px solid #dc3545' : '1px solid #ffc107'
                            }}>{order.status}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="customer-info" style={{
                        marginBottom: '25px',
                        padding: '20px',
                        background: '#f0fdf4',
                        borderRadius: '12px',
                        border: '1px solid #c3e6cb'
                    }}>
                        <h3 style={{ fontSize: '12px', color: '#28a745', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Bill To</h3>
                        <p className="customer-name" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#1a1a2e' }}>{user?.name || 'Customer'}</p>
                        <p style={{ fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>{user?.email}</p>
                        <p style={{ fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>{user?.phone}</p>
                        {user?.address && (
                            <p className="address" style={{ fontSize: '13px', color: '#4a5568' }}>
                                {user.address.street}, {user.address.city}, {user.address.state} - {user.address.pincode}
                            </p>
                        )}
                    </div>


                    {/* Items Table */}
                    <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#28a745', color: 'white', padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>#</th>
                                <th style={{ background: '#28a745', color: 'white', padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Item</th>
                                <th style={{ background: '#28a745', color: 'white', padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Qty</th>
                                <th style={{ background: '#28a745', color: 'white', padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Price</th>
                                <th style={{ background: '#28a745', color: 'white', padding: '14px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                    <td style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b' }}>{index + 1}</td>
                                    <td style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                                        {item.productId?.name || item.name || 'Product'}
                                    </td>
                                    <td style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center', color: '#1e293b' }}>{item.quantity || 1}</td>
                                    <td style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center', color: '#1e293b' }}>₹{(item.price || item.productId?.price || 0).toFixed(2)}</td>
                                    <td style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                                        ₹{((item.price || item.productId?.price || 0) * (item.quantity || 1)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="totals" style={{ marginLeft: 'auto', width: '280px', background: '#f8fafc', padding: '18px 22px', borderRadius: '12px' }}>
                        <div className="totals-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#1e293b' }}>
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="totals-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#1e293b' }}>
                            <span>Delivery:</span>
                            <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="totals-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#28a745' }}>
                                <span>Discount:</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="totals-row total" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 0 8px',
                            fontSize: '17px',
                            fontWeight: '700',
                            color: '#1a1a2e',
                            borderTop: '2px solid #28a745',
                            marginTop: '8px'
                        }}>
                            <span>Grand Total:</span>
                            <span style={{ color: '#28a745' }}>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="payment-info" style={{
                        marginTop: '25px',
                        padding: '16px 22px',
                        background: '#d4edda',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid #c3e6cb'
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span style={{ color: '#155724', fontSize: '15px', fontWeight: '500' }}>
                            Payment: {order.paymentMethod === 'wallet' ? 'Paid via Wallet' : order.paymentMethod === 'friend_wallet' ? 'Paid via Friend\'s Wallet' : 'Cash on Delivery'}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="footer" style={{
                        textAlign: 'center',
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '2px dashed #e2e8f0',
                        color: '#6c757d',
                        fontSize: '13px'
                    }}>
                        <p style={{ fontWeight: '600', color: '#4a5568', marginBottom: '5px' }}>Thank you for shopping with Express Basket!</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderBill;
