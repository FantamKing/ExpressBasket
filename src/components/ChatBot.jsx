import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useUser } from '../context/UserContext.jsx';
import { useCart } from '../context/CartContext.jsx';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(102, 126, 234, 0); }
`;

const typing = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    bottom: 120px; /* Above mobile navigation bar */
    right: 15px;
  }
`;

const ChatButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }
  
  svg {
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 75px;
  right: 0;
  width: 400px;
  height: 550px;
  background: var(--card-bg, #ffffff);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease forwards;
  user-select: none;
  
  @media (max-width: 480px) {
    width: 95vw;
    height: 75vh;
    right: -10px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: move;
  user-select: none;
`;

const BotAvatar = styled.div`
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${bounce} 2s ease-in-out infinite;
  
  svg {
    color: white;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  
  h3 {
    color: white;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    
    &::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
    }
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: var(--bg-color, #f8f9fa);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const Message = styled.div`
  display: flex;
  gap: 10px;
  animation: ${slideIn} 0.3s ease forwards;
  animation-delay: ${props => props.$delay || '0s'};
  opacity: 0;
  
  ${props => props.$isUser && css`
    flex-direction: row-reverse;
  `}
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$isUser ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: ${props => props.$isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.$isUser ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--card-bg, white)'};
  color: ${props => props.$isUser ? 'white' : 'var(--text-color, #333)'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 5px;
  padding: 15px;
  
  span {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: ${typing} 1s infinite;
    
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 15px 20px;
  background: var(--card-bg, white);
  border-top: 1px solid var(--border-color, #eee);
`;

const QuickActionButton = styled.button`
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #ddd);
  background: var(--bg-color, #f8f9fa);
  color: var(--text-color, #333);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    
    svg {
      stroke: white;
    }
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: var(--card-bg, white);
  border-top: 1px solid var(--border-color, #eee);
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 25px;
  border: 1px solid var(--border-color, #ddd);
  background: var(--bg-color, #f8f9fa);
  color: var(--text-color, #333);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary, #999);
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ProductCard = styled.div`
  background: var(--bg-color, #f8f9fa);
  border-radius: 12px;
  padding: 12px;
  margin-top: 10px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: var(--card-bg, white);
    border-color: #1a8754;
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(26, 135, 84, 0.15);
  }
  
  img {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .info {
    flex: 1;
    
    h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: var(--text-color, #333);
    }
    
    .price {
      font-weight: 600;
      color: #1a8754;
      font-size: 14px;
    }
    
    .old-price {
      text-decoration: line-through;
      color: #999;
      font-size: 12px;
      margin-left: 5px;
    }
    
    .discount {
      background: #dcfce7;
      color: #16a34a;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    }
  }
  
  .view-icon {
    color: #1a8754;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover .view-icon {
    opacity: 1;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  vertical-align: middle;
  
  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }
`;

// Lucide-style Icons
const BotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <circle cx="8" cy="16" r="1" fill="white" />
    <circle cx="16" cy="16" r="1" fill="white" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Drag state
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Get user context and location
  const { user } = useUser();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // COMPREHENSIVE KNOWLEDGE BASE - User Panel FAQ
  // ============================================================
  const knowledgeBase = [
    // ACCOUNT & LOGIN
    {
      keywords: ['sign up', 'register', 'create account', 'new account', 'registration'],
      response: "To create an account:\n\n1. Click on 'Profile' in the header\n2. Select 'Sign Up'\n3. Enter your name, email, phone & password\n4. Verify your email/OTP\n5. You're ready to shop!\n\nYou'll get access to order tracking, wallet, and exclusive offers!"
    },

    {
      keywords: ['login', 'sign in', 'log in', 'access account'],
      response: "To log in:\n\n1. Click 'Profile' in the header\n2. Enter your email/phone and password\n3. Click 'Login'\n\nForgot password? Click 'Forgot Password' to reset it via email."
    },

    {
      keywords: ['forgot password', 'reset password', 'change password', 'password reset'],
      response: "To reset your password:\n\n1. Go to Login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for reset link\n5. Create a new password\n\nMake sure to use a strong password with letters, numbers, and symbols!"
    },

    {
      keywords: ['update profile', 'edit profile', 'change name', 'change email', 'change phone'],
      response: "To update your profile:\n\n1. Go to 'Profile' page\n2. Click on 'Edit Profile' or the edit icon\n3. Update your name, email, phone, or address\n4. Click 'Save Changes'\n\nYour changes will be updated immediately!"
    },

    {
      keywords: ['logout', 'sign out', 'log out'],
      response: "To logout:\n\n1. Go to 'Profile' page\n2. Scroll down and click 'Logout'\n\nYou'll need to login again to access your account, orders, and wallet."
    },

    // ADDRESS
    {
      keywords: ['add address', 'delivery address', 'change address', 'update address', 'address'],
      response: "To manage your delivery address:\n\n1. Go to 'Profile' → 'Addresses'\n2. Click 'Add New Address'\n3. Enter your full address with pincode\n4. Mark as 'Home' or 'Work'\n5. Save the address\n\nYou can set a default address for faster checkout!"
    },

    // WALLET
    {
      keywords: ['wallet', 'wallet balance', 'check balance', 'my balance'],
      response: `Your wallet is your digital payment method!\n\n${user ? `Current Balance: ₹${(user.walletBalance || 0).toLocaleString()}` : 'Login to see your balance.'}\n\nBenefits:\n• Instant payments at checkout\n• Cashback rewards\n• Easy refunds directly to wallet`
    },

    {
      keywords: ['add money', 'recharge wallet', 'top up', 'add funds'],
      response: "To add money to your wallet:\n\n1. Go to 'Profile' → 'Wallet'\n2. Click 'Add Money'\n3. Enter the amount\n4. Choose payment method (UPI/Card/NetBanking)\n5. Complete the payment\n\nMoney is added instantly to your wallet!"
    },

    {
      keywords: ['wallet history', 'transactions', 'payment history'],
      response: "To view wallet transactions:\n\n1. Go to 'Profile' → 'Wallet'\n2. Scroll to see 'Transaction History'\n3. View all credits, debits, and refunds\n\nYou can filter by date or transaction type."
    },

    // SHOPPING & PRODUCTS
    {
      keywords: ['browse', 'shop', 'products', 'view products', 'shopping'],
      response: "To browse products:\n\n1. Click 'Store' in the navigation\n2. Use categories on the left to filter\n3. Use search bar to find specific items\n4. Click any product to view details\n\nYou can sort by price, popularity, or newest arrivals!"
    },

    {
      keywords: ['search', 'find product', 'search product', 'looking for'],
      response: "To search for products:\n\n1. Use the search bar at the top\n2. Type product name or keyword\n3. Press Enter or click search icon\n4. Browse the results\n\nTip: Search by category name to see all items in that category!"
    },

    {
      keywords: ['category', 'categories', 'filter', 'filter by category'],
      response: "To filter by category:\n\n1. Go to 'Store' or 'Categories' page\n2. Click on any category (Vegetables, Fruits, Dairy, etc.)\n3. View all products in that category\n\nYou can also combine category filter with search!"
    },

    {
      keywords: ['sort', 'sort by', 'sort products', 'price low to high', 'price high to low'],
      response: "To sort products:\n\n1. Go to 'Store' page\n2. Look for 'Sort by' dropdown\n3. Choose: Price Low-High, Price High-Low, Newest, or Popular\n\nSorting helps you find the best deals quickly!"
    },

    // CART
    {
      keywords: ['add to cart', 'add item', 'cart add'],
      response: "To add items to cart:\n\n1. Find your desired product\n2. Click 'Add to Cart' button\n3. Adjust quantity using +/- buttons\n\nThe cart icon in the header shows your total items!"
    },

    {
      keywords: ['view cart', 'my cart', 'cart', 'shopping cart', 'cart items'],
      response: `To view your cart:\n\n1. Click the Cart icon in the header\n2. View all items with quantities\n3. Update quantities or remove items\n4. See total amount\n\n${cart.length > 0 ? `You have ${cart.length} item(s) in your cart.` : 'Your cart is empty.'}`
    },

    {
      keywords: ['remove from cart', 'delete from cart', 'remove item'],
      response: "To remove items from cart:\n\n1. Go to Cart page\n2. Find the item to remove\n3. Click the trash/remove icon\n4. Confirm removal\n\nYou can also reduce quantity to 0 to remove an item."
    },

    {
      keywords: ['update quantity', 'change quantity', 'increase quantity', 'decrease quantity'],
      response: "To update item quantity:\n\n1. Go to Cart page\n2. Find the item\n3. Use +/- buttons to adjust quantity\n4. The total updates automatically\n\nNote: Some items may have maximum quantity limits."
    },

    // ORDERS & CHECKOUT
    {
      keywords: ['place order', 'how to order', 'checkout', 'buy', 'purchase'],
      response: "To place an order:\n\n1. Add items to cart\n2. Go to Cart → Click 'Checkout'\n3. Choose/add delivery address\n4. Select payment method\n5. Apply coupon if you have one\n6. Click 'Place Order'\n\nYou'll receive order confirmation via email/SMS!"
    },

    {
      keywords: ['track order', 'order status', 'where is my order', 'order tracking', 'delivery status'],
      response: "To track your order:\n\n1. Go to 'Profile' → 'My Orders'\n2. Find your order and click 'Track'\n3. See real-time status:\n   • Confirmed → Being prepared\n   • Packed → Ready for pickup\n   • Out for Delivery → On the way!\n   • Delivered → Enjoy!\n\nYou can see delivery partner location on the map!"
    },

    {
      keywords: ['order history', 'my orders', 'past orders', 'previous orders'],
      response: "To view order history:\n\n1. Go to 'Profile' → 'My Orders'\n2. See all past and current orders\n3. Click any order for details\n\nYou can reorder items from previous orders with one click!"
    },

    {
      keywords: ['cancel order', 'order cancellation'],
      response: "To cancel an order:\n\n1. Go to 'Profile' → 'My Orders'\n2. Select the order to cancel\n3. Click 'Cancel Order'\n4. Select cancellation reason\n5. Confirm cancellation\n\nNote: Orders can only be cancelled before they're packed. Refund will be credited to your wallet."
    },

    {
      keywords: ['reorder', 'order again', 'repeat order'],
      response: "To reorder previous items:\n\n1. Go to 'Profile' → 'My Orders'\n2. Find the order you want to repeat\n3. Click 'Reorder' button\n4. All items will be added to cart\n5. Proceed to checkout\n\nThis is the fastest way to order your regular items!"
    },

    // PAYMENT
    {
      keywords: ['payment', 'payment method', 'pay', 'payment options', 'how to pay'],
      response: "Payment methods available:\n\n1. **Wallet** - Instant & hassle-free\n2. **UPI** - GPay, PhonePe, Paytm\n3. **Credit/Debit Card**\n4. **Net Banking**\n5. **Cash on Delivery (COD)**\n\nWallet payments are fastest and may offer extra cashback!"
    },

    {
      keywords: ['cod', 'cash on delivery', 'pay on delivery', 'pay later'],
      response: "Cash on Delivery (COD):\n\n• Pay when order arrives\n• Available for orders under ₹5,000\n• Keep exact change ready\n• Delivery partner will collect payment\n\nNote: Some areas may have COD restrictions."
    },

    {
      keywords: ['coupon', 'discount code', 'promo code', 'apply coupon', 'discount'],
      response: "To apply a coupon:\n\n1. Add items to cart\n2. Go to Checkout\n3. Find 'Apply Coupon' section\n4. Enter your coupon code\n5. Click 'Apply'\n\nDiscount will be shown in order summary. Check 'Deals' section for available coupons!"
    },

    {
      keywords: ['refund', 'get refund', 'money back', 'refund status'],
      response: "Refund policy:\n\n• Cancelled orders: Refund to wallet within 24 hours\n• Damaged items: Refund after inspection\n• Wrong items: Immediate replacement or refund\n\nRefunds are credited to your wallet for faster processing. You can withdraw to bank if needed."
    },

    // MEMBERSHIP & REWARDS
    {
      keywords: ['membership', 'loyalty', 'badge', 'rewards', 'loyalty badge'],
      response: `Loyalty Membership Tiers:\n\n🥈 **Silver** - 5% extra discount\n🥇 **Gold** - 10% extra discount + Free delivery\n💎 **Platinum** - 15% discount + Priority delivery + Exclusive deals\n\n${user?.loyaltyBadge?.type ? `Your badge: ${user.loyaltyBadge.type.toUpperCase()}` : 'Start shopping to earn badges!'}\n\nHigher tiers unlock more benefits!`
    },

    {
      keywords: ['silver', 'silver membership', 'silver badge'],
      response: "🥈 Silver Membership:\n\n• 5% extra discount on all orders\n• Early access to sales\n• Birthday special offers\n• Valid for 1 year\n\nUpgrade to Gold for more benefits!"
    },

    {
      keywords: ['gold', 'gold membership', 'gold badge'],
      response: "🥇 Gold Membership:\n\n• 10% extra discount on all orders\n• Free delivery on all orders\n• Priority customer support\n• Exclusive deals & offers\n• Valid for 1 year\n\nUpgrade to Platinum for maximum benefits!"
    },

    {
      keywords: ['platinum', 'platinum membership', 'platinum badge'],
      response: "💎 Platinum Membership:\n\n• 15% extra discount on all orders\n• Free express delivery\n• Priority delivery (fastest)\n• VIP customer support\n• Early access to new products\n• Exclusive Platinum-only deals\n• Valid for 1 year\n\nThe ultimate shopping experience!"
    },

    {
      keywords: ['upgrade', 'upgrade membership', 'buy membership', 'get membership'],
      response: "To upgrade your membership:\n\n1. Go to 'Profile' → 'Membership'\n2. Compare Silver, Gold, Platinum benefits\n3. Select desired tier\n4. Complete payment\n\nMembership is activated instantly and valid for 1 year!"
    },

    // DELIVERY
    {
      keywords: ['delivery time', 'when will order arrive', 'delivery hours', 'delivery timing'],
      response: "Delivery information:\n\n• **Standard**: 2-4 hours\n• **Express** (Gold/Platinum): 30-60 minutes\n• **Delivery hours**: 8 AM - 10 PM\n• **Sunday**: Limited delivery in some areas\n\nTrack your order for real-time updates!"
    },

    {
      keywords: ['delivery partner', 'delivery person', 'contact delivery', 'call delivery'],
      response: "To contact delivery partner:\n\n1. Go to 'My Orders' → Select active order\n2. Click on 'Track Order'\n3. You'll see delivery partner details\n4. Click phone icon to call\n\nYou can also chat with the delivery partner through the app!"
    },

    {
      keywords: ['delivery charges', 'delivery fee', 'shipping cost', 'delivery cost'],
      response: "Delivery charges:\n\n• **Free Delivery**: Orders above ₹500\n• **Standard Fee**: ₹40 for orders below ₹500\n• **Gold/Platinum Members**: Always free!\n\nTip: Add more items to get free delivery!"
    },

    {
      keywords: ['delivery area', 'deliver to', 'serviceable', 'do you deliver'],
      response: "To check delivery availability:\n\n1. Enter your pincode on homepage\n2. Or add address in profile\n3. System will confirm if your area is serviceable\n\nWe're constantly expanding our delivery areas!"
    },

    // SUPPORT
    {
      keywords: ['help', 'support', 'customer support', 'contact us', 'contact support'],
      response: "Need help? We're here for you!\n\n📧 Email: support@expressbasket.com\n📞 Phone: 1800-XXX-XXXX\n💬 Live Chat: Available in Profile → Support\n\nSupport hours: 9 AM - 9 PM, all days\n\nGold/Platinum members get priority support!"
    },

    {
      keywords: ['report issue', 'complaint', 'problem', 'issue with order'],
      response: "To report an issue:\n\n1. Go to 'My Orders'\n2. Select the order with issue\n3. Click 'Report Issue' or 'Help'\n4. Describe the problem\n5. Add photos if needed\n6. Submit\n\nOur team will respond within 2-4 hours!"
    },

    {
      keywords: ['return', 'return item', 'return policy', 'exchange'],
      response: "Return & Exchange Policy:\n\n• Report issues within 24 hours of delivery\n• Damaged/wrong items: Full refund or replacement\n• Quality issues: Refund after verification\n• Fresh produce: Same-day reporting required\n\nGo to 'My Orders' → Select order → 'Report Issue' to initiate return."
    },

    // GENERAL & CONVERSATIONAL
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'hola'],
      response: `Hello${user ? ` ${user.name}` : ''}! 👋\n\nI'm your Express Basket shopping assistant. How can I help you today?\n\n• Ask about orders, products, or payments\n• Check your account or wallet\n• Learn about memberships & offers\n• Get help with any issues\n\nJust type your question!`
    },

    {
      keywords: ['how are you', 'how r u', 'hows it going', 'how you doing', 'whats up', "what's up", 'sup'],
      response: `I'm doing great, thank you for asking! 😊\n\nI'm your Express Basket shopping assistant, always ready to help you 24/7!\n\nHow can I assist you today? Ask me about:\n• Products & shopping\n• Orders & delivery\n• Payments & wallet\n• Memberships & rewards`
    },

    {
      keywords: ['who are you', 'what are you', 'your name', 'who is this', 'who am i talking to'],
      response: "I'm your Express Basket Shopping Assistant! 🤖\n\nI'm here to help you with:\n• Finding products & deals\n• Tracking orders\n• Managing your account & wallet\n• Learning about memberships\n• Answering questions about our store\n\nI'm available 24/7 - just type your question!"
    },

    {
      keywords: ['what can you do', 'what do you do', 'your capabilities', 'can you help', 'how can you help'],
      response: "Here's what I can help you with! 🎯\n\n**Shopping**\n• Browse products & categories\n• Find deals & discounts\n• Search for items\n\n**Orders**\n• Track your order\n• Cancel/reorder\n• Report issues\n\n**Account**\n• Profile & addresses\n• Wallet balance\n• Memberships\n\n**Payments**\n• Payment methods\n• Refunds\n• Coupons\n\nJust ask your question!"
    },

    {
      keywords: ['i love you', 'love you', 'i like you', 'youre awesome', 'you are awesome', 'youre great'],
      response: "Aww, thank you so much! 😊💜\n\nI'm just doing my best to help you shop better! Your kind words made my day.\n\nIs there anything I can help you with today? Happy shopping! 🛒✨"
    },

    {
      keywords: ['you suck', 'youre bad', 'you are bad', 'useless', 'stupid', 'dumb'],
      response: "I'm sorry if I couldn't help you properly. 😔\n\nI'm always learning to be better! If you have a specific question, please try asking in a different way and I'll do my best to help.\n\nOr you can contact our human support team:\n📧 support@expressbasket.com\n📞 1800-XXX-XXXX"
    },

    {
      keywords: ['lol', 'haha', 'hehe', 'funny', 'joke', 'tell me a joke'],
      response: "Haha! 😄 Here's a grocery joke for you:\n\nWhy did the tomato turn red?\n🍅 Because it saw the salad dressing!\n\nOkay, okay... I'll stick to helping you shop! 😅\n\nAnything else I can help you with?"
    },

    {
      keywords: ['bored', 'im bored', 'nothing to do'],
      response: "Bored? Let me help! 🎉\n\n**Here are some ideas:**\n• Check out today's **Deals** - new discounts daily!\n• Browse **New Arrivals** - fresh products just added\n• Explore different **Categories**\n• Check your **Rewards** - maybe you can upgrade!\n\nClick the buttons below or ask me about any of these!"
    },

    {
      keywords: ['good job', 'well done', 'nice', 'great', 'perfect', 'awesome'],
      response: "Thank you so much! 🎉😊\n\nI'm glad I could help! Feel free to ask me anything else.\n\nHappy shopping at Express Basket! 🛒"
    },

    {
      keywords: ['ok', 'okay', 'alright', 'fine', 'got it', 'understood', 'i see'],
      response: "Great! 👍\n\nIs there anything else you'd like to know? I'm here to help with:\n• Orders & Tracking\n• Products & Deals\n• Payments & Wallet\n• Memberships\n\nJust ask!"
    },

    {
      keywords: ['yes', 'yeah', 'yep', 'sure', 'of course'],
      response: "Awesome! 👍\n\nWhat would you like to know more about? Just type your question!"
    },

    {
      keywords: ['no', 'nope', 'not really', 'nothing'],
      response: "No problem! 😊\n\nI'm here whenever you need help. Just open this chat and ask me anything!\n\nHappy shopping! 🛒"
    },

    {
      keywords: ['thank', 'thanks', 'thank you', 'thx', 'ty'],
      response: "You're welcome! 😊\n\nIs there anything else I can help you with? Feel free to ask about:\n• Orders & Tracking\n• Products & Deals\n• Payments & Wallet\n• Memberships & Rewards\n\nHappy shopping! 🛒"
    },

    {
      keywords: ['bye', 'goodbye', 'see you', 'later', 'cya', 'gtg'],
      response: "Goodbye! 👋\n\nThank you for shopping with Express Basket!\n\nCome back anytime - I'm always here to help 24/7.\n\nHappy shopping! 🛒✨"
    },

    {
      keywords: ['offers', 'deals', 'sale', 'discount', 'best deals'],
      response: "Current Offers & Deals:\n\n🔥 Check our 'Deals' section for:\n• Daily price drops\n• Combo offers\n• Buy 1 Get 1 deals\n• Seasonal discounts\n\n💎 Membership holders get extra discounts!\n\nClick 'Deals' in the navigation or ask me to 'show deals'!"
    },

    {
      keywords: ['time', 'what time', 'current time'],
      response: `The current time is: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n\nOur delivery hours are 8 AM - 10 PM, all days!\n\nAnything else I can help you with?`
    },

    {
      keywords: ['today', 'date', 'what day', 'what date'],
      response: `Today is: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nReady to shop? Check out today's fresh deals! 🛒`
    },
  ];

  // Smart query processor with fuzzy matching
  const processQuery = (query) => {
    const normalizedQuery = query.toLowerCase().trim();

    // Check each knowledge base entry
    let bestMatch = null;
    let highestScore = 0;

    for (const entry of knowledgeBase) {
      let score = 0;

      for (const keyword of entry.keywords) {
        // Exact match
        if (normalizedQuery.includes(keyword)) {
          score += keyword.split(' ').length * 3; // Multi-word matches score higher
        }
        // Partial word matches
        const keywordWords = keyword.split(' ');
        for (const word of keywordWords) {
          if (word.length > 3 && normalizedQuery.includes(word)) {
            score += 1;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && highestScore >= 1) {
      return bestMatch.response;
    }

    // Default response when no match found
    return `I'm not sure about that, but I can help you with:\n\n• **Orders** - Track, cancel, reorder\n• **Products** - Search, browse, deals\n• **Payments** - Wallet, methods, refunds\n• **Membership** - Silver, Gold, Platinum\n• **Support** - Report issues, returns\n\nTry asking something like:\n"How do I track my order?"\n"What's my wallet balance?"\n"Tell me about gold membership"`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag handlers
  const startPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const dragLocked = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    hasDragged.current = false;
    dragLocked.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    // Get container position for correct offset calculation
    const containerEl = document.querySelector('[data-chatbot-container]');
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    // Check if mouse moved more than 5px (threshold for drag vs click)
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 5 || dy > 5) {
      hasDragged.current = true;
      dragLocked.current = true;
      // Only update position if threshold crossed
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      // Keep within viewport bounds
      const maxX = window.innerWidth - 70;
      const maxY = window.innerHeight - 70;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    const wasDragged = hasDragged.current;
    setIsDragging(false);
    // Only open if there was NO drag at all
    if (!wasDragged && !isOpen) {
      setIsOpen(true);
    }
    // Reset after a short delay
    setTimeout(() => {
      dragLocked.current = false;
    }, 100);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    hasDragged.current = false;
    dragLocked.current = false;
    startPos.current = { x: touch.clientX, y: touch.clientY };
    const containerEl = document.querySelector('[data-chatbot-container]');
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startPos.current.x);
    const dy = Math.abs(touch.clientY - startPos.current.y);
    if (dx > 5 || dy > 5) {
      hasDragged.current = true;
      dragLocked.current = true;
      // Only update position if threshold crossed
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - 70;
      const maxY = window.innerHeight - 70;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleTouchEnd = () => {
    const wasDragged = hasDragged.current;
    setIsDragging(false);
    if (!wasDragged && !isOpen) {
      setIsOpen(true);
    }
    setTimeout(() => {
      dragLocked.current = false;
    }, 100);
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greeting = user
          ? `Hi ${user.name}! I'm your shopping assistant. I can tell you about this page, your account, show deals, and more!`
          : "Hi there! I'm your shopping assistant. I can help you discover products, find deals, and tell you about our store!";
        addBotMessage(greeting);
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text, products = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { text, isUser: false, products, time: new Date() }]);
    }, 800);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { text, isUser: true, time: new Date() }]);
  };

  // Handle sending messages from the input field
  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;

    // Add user message
    addUserMessage(message);
    setInputValue('');

    // Process the query and get response
    const response = processQuery(message);

    // Add bot response with typing effect
    addBotMessage(response);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Page info based on current route
  const getPageInfo = () => {
    const path = location.pathname;
    const pages = {
      '/': { name: 'Home', desc: 'Browse featured products, categories, and search for anything you need!' },
      '/store': { name: 'Store', desc: 'View all products, filter by category, and find exactly what you\'re looking for.' },
      '/cart': { name: 'Cart', desc: 'Review your cart items, update quantities, and proceed to checkout.' },
      '/profile': { name: 'Profile', desc: 'View your account details, order history, wallet balance, and loyalty badges.' },
      '/categories': { name: 'Categories', desc: 'Explore all product categories available in our store.' },
      '/login': { name: 'Login/Signup', desc: 'Sign in to your account or create a new one to start shopping.' }
    };
    return pages[path] || { name: 'Page', desc: 'You\'re exploring our grocery store website.' };
  };

  const showCurrentPage = () => {
    addUserMessage("What's on this page?");
    const pageInfo = getPageInfo();
    const cartInfo = cart.length > 0 ? `\n\nYou have ${cart.length} item(s) in your cart.` : '';
    addBotMessage(`You're on the ${pageInfo.name} page!\n\n${pageInfo.desc}${cartInfo}`);
  };

  const showMyAccount = () => {
    addUserMessage("Show my account details");

    if (!user) {
      addBotMessage("You're not logged in yet.\n\nTo see your account details, please log in first. Click on 'Profile' in the header to sign in or create an account!");
      return;
    }

    const walletBalance = user.walletBalance || 0;
    // loyaltyBadge is an object with .type property
    const badgeType = user.loyaltyBadge?.type || user.loyaltyBadge || 'none';
    const badgeDisplay = typeof badgeType === 'string'
      ? badgeType.charAt(0).toUpperCase() + badgeType.slice(1)
      : 'None';

    const accountInfo = `Your Account Details

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not set'}
Wallet Balance: Rs.${walletBalance.toLocaleString()}
Loyalty Badge: ${badgeDisplay}
Cart Items: ${cart.length}`;

    addBotMessage(accountInfo);
  };

  const showAboutWebsite = () => {
    addUserMessage("Tell me about this website");
    addBotMessage(`Welcome to Express Basket!

We're your one-stop grocery store with:

- Fresh vegetables & fruits
- Dairy products
- Bakery items
- Quick add-to-cart shopping
- Wallet system for easy payments
- Loyalty badges & rewards
- Fast delivery to your doorstep

Explore categories, find deals, and enjoy hassle-free shopping!`);
  };

  const fetchNewProducts = async () => {
    addUserMessage("Show me new products");
    try {
      const response = await axios.get('/products');
      const products = response.data || [];
      const newest = products
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

      if (newest.length > 0) {
        addBotMessage("Here are the newest arrivals! Click any product to view:", newest);
      } else {
        addBotMessage("No new products found. Check back soon!");
      }
    } catch (error) {
      addBotMessage("Sorry, couldn't fetch products. Please try again!");
    }
  };

  const fetchPriceDrops = async () => {
    addUserMessage("Show me deals & discounts");
    try {
      const response = await axios.get('/products');
      const products = response.data || [];
      const deals = products
        .filter(p => (p.originalPrice && p.originalPrice > p.price) || p.discount > 0)
        .slice(0, 5);

      if (deals.length > 0) {
        addBotMessage("Hot deals with price drops! Click any to view:", deals);
      } else {
        addBotMessage("No special deals right now, but keep checking!");
      }
    } catch (error) {
      addBotMessage("Sorry, couldn't fetch deals. Please try again!");
    }
  };

  const showHelp = () => {
    addUserMessage("What can you do?");
    addBotMessage(`I can help you with:

- My Account: Your profile & wallet info
- This Page: Info about current page
- About Us: Learn about our store
- New Products: Latest arrivals
- Deals: Products with discounts

I know everything about this website and can guide you around!`);
  };

  return (
    <ChatContainer
      data-chatbot-container
      style={position.x !== null ? {
        left: position.x,
        top: position.y,
        right: 'auto',
        bottom: 'auto'
      } : {}}
    >
      {isOpen && (
        <ChatWindow
          $isClosing={isClosing}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <ChatHeader>
            <BotAvatar>
              <BotIcon />
            </BotAvatar>
            <HeaderInfo>
              <h3>Shopping Assistant</h3>
              <span>{user ? `Hi, ${user.name}!` : 'Always here to help'}</span>
            </HeaderInfo>
            <CloseButton onClick={handleClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </CloseButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((msg, index) => (
              <Message key={index} $isUser={msg.isUser} $delay={`${index * 0.1}s`}>
                <MessageAvatar $isUser={msg.isUser}>
                  {msg.isUser ? <UserIcon /> : <BotIcon />}
                </MessageAvatar>
                <div>
                  <MessageBubble $isUser={msg.isUser}>
                    {msg.text}
                  </MessageBubble>
                  {msg.products && msg.products.map((product, i) => (
                    <ProductCard
                      key={i}
                      onClick={() => {
                        // Navigate to store with product ID as highlight parameter
                        // The category could be an object with _id or just an ID string
                        const categoryId = product.category?._id || product.category;
                        const productId = product._id;
                        if (categoryId && typeof categoryId === 'string') {
                          navigate(`/store?category=${encodeURIComponent(categoryId)}&highlight=${productId}`);
                        } else {
                          // Fallback to search by product name with highlight
                          navigate(`/store?search=${encodeURIComponent(product.name)}&highlight=${productId}`);
                        }
                        handleClose();
                      }}
                      title={`View ${product.name}`}
                    >
                      <img
                        src={product.image?.startsWith('http') ? product.image : '/placeholder-image.png'}
                        alt={product.name}
                        onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                      />
                      <div className="info">
                        <h4>{product.name}</h4>
                        <div>
                          <span className="price">Rs.{product.price}</span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="old-price">Rs.{product.originalPrice}</span>
                              <span className="discount">
                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="view-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </ProductCard>
                  ))}
                </div>
              </Message>
            ))}

            {isTyping && (
              <Message>
                <MessageAvatar>
                  <BotIcon />
                </MessageAvatar>
                <MessageBubble>
                  <TypingIndicator>
                    <span></span>
                    <span></span>
                    <span></span>
                  </TypingIndicator>
                </MessageBubble>
              </Message>
            )}

            <div ref={messagesEndRef} />
          </ChatMessages>

          <QuickActions>
            <QuickActionButton onClick={showMyAccount}>
              <UserIcon /> My Account
            </QuickActionButton>
            <QuickActionButton onClick={showCurrentPage}>
              <MapPinIcon /> This Page
            </QuickActionButton>
            <QuickActionButton onClick={showAboutWebsite}>
              <StoreIcon /> About Us
            </QuickActionButton>
            <QuickActionButton onClick={fetchNewProducts}>
              <SparklesIcon /> New
            </QuickActionButton>
            <QuickActionButton onClick={fetchPriceDrops}>
              <FlameIcon /> Deals
            </QuickActionButton>
            <QuickActionButton onClick={showHelp}>
              <HelpCircleIcon /> Help
            </QuickActionButton>
          </QuickActions>

          {/* Chat Input Field */}
          <ChatInputContainer onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <ChatInput
              type="text"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SendButton onClick={handleSendMessage} disabled={!inputValue.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}

      <ChatButton
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          display: isOpen ? 'none' : 'flex',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <BotIcon />
      </ChatButton>
    </ChatContainer>
  );
};

export default ChatBot;
