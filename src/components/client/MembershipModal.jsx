import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Wallet, Calendar, Shield, Sparkles, Clock, AlertCircle, Award, Star, Gem, Medal } from 'lucide-react';
import axios from '../../utils/axios';
import Swal from 'sweetalert2';
import './MembershipModal.css';

// Icon mapping for badge types
const BadgeIcons = {
  silver: Medal,
  gold: Award,
  platinum: Gem
};

const MembershipModal = ({ isOpen, onClose, currentMembership, walletBalance, onSuccess }) => {
  const [badges, setBadges] = useState([]);
  const [durations, setDurations] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBadgePrices();
    }
  }, [isOpen]);

  const fetchBadgePrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/badges/prices');
      setBadges(response.data.badges);
      setDurations(response.data.durations);
    } catch (error) {
      console.error('Error fetching badge prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveMembership = () => {
    if (!currentMembership || currentMembership.type === 'none') return false;
    const expiresAt = new Date(currentMembership.expiresAt);
    return expiresAt > new Date();
  };

  const getDaysRemaining = () => {
    if (!currentMembership?.expiresAt) return 0;
    const expiresAt = new Date(currentMembership.expiresAt);
    const now = new Date();
    return Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  };

  const handlePurchase = async (badgeType) => {
    if (hasActiveMembership()) {
      Swal.fire({
        icon: 'warning',
        title: 'Active Membership',
        text: `You already have an active ${currentMembership.type} membership with ${getDaysRemaining()} days remaining.`,
        confirmButtonColor: '#28a745'
      });
      return;
    }

    const badge = badges.find(b => b.type === badgeType);
    const price = badge.prices[selectedDuration];
    const durationLabel = durations.find(d => d.key === selectedDuration)?.label || selectedDuration;

    if (walletBalance < price) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Balance',
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p><strong>Required:</strong> ${price}</p>
            <p><strong>Your Balance:</strong> ${walletBalance.toFixed(2)}</p>
            <p><strong>Shortfall:</strong> ${(price - walletBalance).toFixed(2)}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Please top up your wallet to proceed.</p>
        `,
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Got it'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Purchase',
      html: `
        <div style="text-align: left; padding: 15px 0;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="width: 48px; height: 48px; background: ${badge.gradient}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; text-transform: capitalize;">${badge.name} Membership</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">${durationLabel} Plan</p>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0 0 5px 0; color: #666;">Amount to be deducted:</p>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #28a745;">${price}</p>
          </div>
          <p style="color: #666; font-size: 13px; margin: 0;">Your new wallet balance will be ${(walletBalance - price).toFixed(2)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Purchase',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setPurchasing(true);
        const token = localStorage.getItem('userToken');
        const response = await axios.post('/user/buy-badge',
          { badgeType, duration: selectedDuration },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          icon: 'success',
          title: 'Membership Activated!',
          html: `
            <div style="text-align: center; padding: 10px 0;">
              <div style="width: 64px; height: 64px; background: ${badge.gradient}; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <h3 style="margin: 10px 0; text-transform: capitalize;">${badge.name} Member</h3>
              <p style="color: #666;">Your ${durationLabel.toLowerCase()} membership is now active!</p>
              <p style="color: #28a745; font-weight: 600; margin-top: 15px;">New Balance: ${response.data.newBalance.toFixed(2)}</p>
            </div>
          `,
          confirmButtonColor: '#28a745'
        });

        if (onSuccess) onSuccess(response.data);
        onClose();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Purchase Failed',
          text: error.response?.data?.message || 'Failed to purchase membership',
          confirmButtonColor: '#28a745'
        });
      } finally {
        setPurchasing(false);
      }
    }
  };

  const calculateSavings = (badge) => {
    const monthlyTotal = badge.prices.monthly * 12;
    const yearlyPrice = badge.prices.yearly;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { savings, percentage };
  };

  const getActiveMembershipIcon = () => {
    if (!currentMembership?.type || currentMembership.type === 'none') return null;
    const IconComponent = BadgeIcons[currentMembership.type];
    return IconComponent ? <IconComponent size={24} /> : <Award size={24} />;
  };

  if (!isOpen) return null;

  return (
    <div className="membership-modal-overlay" onClick={onClose}>
      <div className="membership-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="membership-modal-header">
          <div className="membership-header-content">
            <Crown className="membership-header-icon" size={28} />
            <div>
              <h2>Premium Memberships</h2>
              <p>Unlock exclusive benefits and save more</p>
            </div>
          </div>
          <button className="membership-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Wallet Balance */}
        <div className="membership-wallet-banner">
          <div className="wallet-info">
            <Wallet size={20} />
            <span>Wallet Balance</span>
          </div>
          <span className="wallet-amount">{walletBalance.toFixed(2)}</span>
        </div>

        {/* Current Active Membership */}
        {hasActiveMembership() && (
          <div className="membership-current-active">
            <div className="current-membership-card">
              <div className={`current-badge-icon ${currentMembership.type}`}>
                {getActiveMembershipIcon()}
              </div>
              <div className="current-membership-info">
                <div className="current-membership-header">
                  <span className="current-badge-label">Current Membership</span>
                  <span className={`current-badge-type ${currentMembership.type}`}>
                    {currentMembership.type?.charAt(0).toUpperCase() + currentMembership.type?.slice(1)}
                  </span>
                </div>
                <div className="current-membership-details">
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>Expires: {new Date(currentMembership.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="detail-item days-remaining">
                    <Clock size={14} />
                    <span><strong>{getDaysRemaining()}</strong> days remaining</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="membership-blocked-notice">
              <AlertCircle size={16} />
              <span>You cannot purchase a new membership until your current one expires.</span>
            </div>
          </div>
        )}

        {/* Duration Tabs */}
        <div className="membership-duration-tabs">
          {durations.map(duration => (
            <button
              key={duration.key}
              className={`duration-tab ${selectedDuration === duration.key ? 'active' : ''}`}
              onClick={() => setSelectedDuration(duration.key)}
            >
              <span className="duration-label">{duration.label}</span>
              <span className="duration-badge">{duration.badge}</span>
              {duration.popular && <span className="tab-badge popular">Popular</span>}
              {duration.savings && <span className="tab-badge savings">Best Value</span>}
            </button>
          ))}
        </div>

        {/* Badge Cards */}
        <div className="membership-cards-container">
          {loading ? (
            <div className="membership-loading">
              <div className="loader"></div>
              <p>Loading memberships...</p>
            </div>
          ) : (
            badges.map((badge, index) => {
              const price = badge.prices[selectedDuration];
              const { savings, percentage } = calculateSavings(badge);
              const isPopular = badge.type === 'gold';
              const isPremium = badge.type === 'platinum';
              const canAfford = walletBalance >= price;
              const BadgeIcon = BadgeIcons[badge.type] || Award;
              const isCurrentPlan = hasActiveMembership() && currentMembership?.type === badge.type;
              const isBlocked = hasActiveMembership() && currentMembership?.type !== badge.type;

              return (
                <div
                  key={badge.type}
                  className={`membership-card ${badge.type} ${isPremium ? 'premium' : ''} ${isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current-plan' : ''}`}
                  style={{ '--card-gradient': badge.gradient, '--card-color': badge.color }}
                >
                  {isCurrentPlan && <div className="card-ribbon current">Current Plan</div>}
                  {!isCurrentPlan && isPopular && <div className="card-ribbon">Most Popular</div>}
                  {!isCurrentPlan && isPremium && <div className="card-ribbon premium">Best Value</div>}
                  
                  <div className="card-header">
                    <div className={`card-icon-wrapper ${badge.type}`}>
                      <BadgeIcon size={32} />
                    </div>
                    <h3 className="card-title">{badge.name}</h3>
                  </div>

                  <div className="card-price">
                    <span className="price-amount">₹{price}</span>
                    <span className="price-duration">/{selectedDuration === 'weekly' ? 'week' : selectedDuration === 'monthly' ? 'month' : 'year'}</span>
                  </div>

                  {selectedDuration === 'yearly' && (
                    <div className="savings-badge">
                      <Sparkles size={14} />
                      <span>Save ₹{savings} ({percentage}% off)</span>
                    </div>
                  )}

                  <ul className="card-benefits">
                    {badge.benefits.map((benefit, i) => (
                      <li key={i}>
                        <Check size={16} className="benefit-check" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`card-buy-btn ${isCurrentPlan ? 'current' : ''} ${isBlocked ? 'blocked' : ''} ${!canAfford && !isCurrentPlan && !isBlocked ? 'disabled' : ''}`}
                    onClick={() => handlePurchase(badge.type)}
                    disabled={purchasing || isCurrentPlan || isBlocked}
                  >
                    {purchasing ? (
                      <span className="btn-loading">Processing...</span>
                    ) : isCurrentPlan ? (
                      <>
                        <Check size={16} />
                        <span>Current Plan</span>
                      </>
                    ) : isBlocked ? (
                      <span>Locked</span>
                    ) : !canAfford ? (
                      <span>Insufficient Balance</span>
                    ) : (
                      <>
                        <Shield size={16} />
                        <span>Get {badge.name}</span>
                      </>
                    )}
                  </button>

                  {!canAfford && !isCurrentPlan && !isBlocked && (
                    <p className="need-more">Need {(price - walletBalance).toFixed(2)} more</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="membership-modal-footer">
          <p>
            <Clock size={14} />
            <span>Membership activates immediately after purchase</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
