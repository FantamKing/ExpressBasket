import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [lastAddedProduct, setLastAddedProduct] = useState('');

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        const newToast = { id, message, type };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showCartToast = useCallback((productName) => {
        // Update the last added product name
        setLastAddedProduct(productName);
    }, []);

    const showMailToast = useCallback((count = 1) => {
        showToast(`You have ${count} new mail${count > 1 ? 's' : ''}!`, 'mail', 5000);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast, showCartToast, showMailToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <CartNotificationPopup lastAddedProduct={lastAddedProduct} />
            <MobileCartBadge />
        </ToastContext.Provider>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className="toast-icon">
                        {toast.type === 'cart' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        )}
                        {toast.type === 'success' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        )}
                        {toast.type === 'mail' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        )}
                    </div>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                </div>
            ))}
        </div>
    );
};

// Cart Notification Popup Component - Only visible on client pages when cart has items (hidden on mobile via CSS)
const CartNotificationPopup = ({ lastAddedProduct }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount, clearCart } = useCart();
    const cartCount = getCartCount();

    // Only show on these specific pages
    const allowedPages = ['/', '/categories', '/store'];
    const shouldShow = allowedPages.includes(location.pathname) || location.pathname.startsWith('/store');

    // Don't show if cart is empty or not on allowed pages
    if (cartCount === 0 || !shouldShow) return null;

    const handleViewCart = () => {
        navigate('/cart');
    };

    const handleClearCart = () => {
        clearCart();
    };

    return (
        <div className="cart-notification-popup">
            <div className="cart-notification-content">
                <div className="cart-notification-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <div className="cart-notification-text">
                    <span className="cart-notification-title">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</span>
                    {lastAddedProduct && <span className="cart-notification-product">Last added: {lastAddedProduct}</span>}
                </div>
                <button className="cart-notification-close" onClick={handleClearCart} title="Clear Cart">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <button className="cart-notification-view-btn" onClick={handleViewCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </button>
        </div>
    );
};

// Mobile Floating Cart Badge - Small floating icon for mobile devices
const MobileCartBadge = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Only show on these specific pages
    const allowedPages = ['/', '/categories', '/store'];
    const shouldShow = allowedPages.includes(location.pathname) || location.pathname.startsWith('/store');

    // Don't show if not mobile, cart is empty, or not on allowed pages
    if (!isMobile || cartCount === 0 || !shouldShow) return null;

    const handleClick = () => {
        navigate('/cart');
    };

    return (
        <button
            onClick={handleClick}
            className="mobile-cart-badge"
            style={{
                position: 'fixed',
                top: '80px',
                right: '15px',
                zIndex: 9999,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span
                style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#dc3545',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                }}
            >
                {cartCount > 9 ? '9+' : cartCount}
            </span>
        </button>
    );
};

export default ToastContext;

