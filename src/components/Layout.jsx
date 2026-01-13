import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ChatBot from './ChatBot.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import axios from '../utils/axios';

const Layout = ({ children }) => {
  const { showMailToast } = useToast();
  const { sessionExpired, clearSessionExpired } = useUser();
  const navigate = useNavigate();
  const lastCountRef = useRef(0);
  const isFirstCheck = useRef(true);

  // Handle session expired
  useEffect(() => {
    if (sessionExpired) {
      // Show alert and redirect
      const timer = setTimeout(() => {
        clearSessionExpired();
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, clearSessionExpired, navigate]);

  useEffect(() => {
    const checkMails = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await axios.get('/user/mails', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const newUnreadCount = response.data.unreadCount || 0;

        // Only show notification if there are new mails (not on first load)
        if (!isFirstCheck.current && newUnreadCount > lastCountRef.current) {
          const newMails = newUnreadCount - lastCountRef.current;
          showMailToast(newMails);
        }

        isFirstCheck.current = false;
        lastCountRef.current = newUnreadCount;
      } catch (error) {
        // Silently fail - user might not be logged in
      }
    };

    // Initial check
    checkMails();

    // Poll every 15 seconds for new mails
    const interval = setInterval(checkMails, 15000);

    return () => clearInterval(interval);
  }, [showMailToast]);

  return (
    <div className="layout">
      {/* Session Expired Alert */}
      {sessionExpired && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'var(--card-bg, #fff)',
            padding: '30px 40px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            maxWidth: '400px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 10px',
              color: 'var(--text-color, #333)',
              fontSize: '20px'
            }}>
              Session Expired
            </h3>
            <p style={{
              color: 'var(--text-secondary, #666)',
              margin: 0,
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              Your account was logged in from another location. You will be redirected to the login page.
            </p>
          </div>
        </div>
      )}
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Layout;