import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import { useTheme } from '../../context/ThemeContext';
import './AdminDirectory.css';

const AdminDirectory = () => {
    const { theme } = useTheme();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAdminRole, setLoadingAdminRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showIntroAnimation, setShowIntroAnimation] = useState(false); // For fullscreen GIF intro
    const [introRevealed, setIntroRevealed] = useState(true); // Avatar visible after GIF ends (true = visible)
    const [firstLoopComplete, setFirstLoopComplete] = useState(false); // Track if first animation loop finished
    const introTimeoutRef = useRef(null); // Ref to track the intro animation timeout

    const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}');

    const getRoleDisplay = (role) => {
        const roleNames = {
            'super_admin': 'Super Admin',
            'admin': 'Admin',
            'vendor': 'Vendor',
            'normal_viewer': 'Normal Viewer',
            'special_viewer': 'Special Viewer'
        };
        return roleNames[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'super_admin': '#f59e0b',
            'admin': '#3b82f6',
            'vendor': '#10b981',
            'normal_viewer': '#8b5cf6',
            'special_viewer': '#ec4899'
        };
        return colors[role] || '#6b7280';
    };

    useEffect(() => {
        fetchAdmins();

        // Refresh data when page becomes visible (user might have updated settings)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAdmins();
            }
        };

        // Refresh when localStorage changes (frame update, etc.)
        const handleStorageChange = (e) => {
            if (e.key === 'admin' || e.key === 'adminToken') {
                fetchAdmins();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/directory', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setAdmins(response.data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (adminId, e) => {
        e.stopPropagation();
        try {
            const response = await axios.post(`/admin/profile/${adminId}/like`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });

            // Update local state
            setAdmins(prev => prev.map(admin =>
                admin._id === adminId
                    ? { ...admin, hasLiked: response.data.liked, likeCount: response.data.likeCount }
                    : admin
            ));

            // Also update selected admin if modal is open
            if (selectedAdmin?._id === adminId) {
                setSelectedAdmin(prev => ({
                    ...prev,
                    hasLiked: response.data.liked,
                    likeCount: response.data.likeCount
                }));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };
    // Function to parse GIF and get its actual duration
    const getGifDuration = async (url) => {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const data = new Uint8Array(buffer);

            let duration = 0;
            let i = 13; // Skip GIF header + Logical Screen Descriptor

            // Check for Global Color Table
            const gctFlag = (data[10] & 0x80) >> 7;
            if (gctFlag) {
                const gctSize = Math.pow(2, (data[10] & 0x07) + 1) * 3;
                i += gctSize;
            }

            // Parse blocks to calculate total duration
            while (i < data.length) {
                if (data[i] === 0x21) { // Extension block
                    if (data[i + 1] === 0xF9) { // Graphics Control Extension
                        const delay = (data[i + 4] | (data[i + 5] << 8)) * 10;
                        duration += delay || 100;
                        i += 8;
                    } else {
                        i += 2;
                        while (data[i] !== 0) i += data[i] + 1;
                        i++;
                    }
                } else if (data[i] === 0x2C) { // Image block
                    i += 10;
                    const lctFlag = (data[i - 1] & 0x80) >> 7;
                    if (lctFlag) i += Math.pow(2, (data[i - 1] & 0x07) + 1) * 3;
                    i++;
                    while (data[i] !== 0) i += data[i] + 1;
                    i++;
                } else if (data[i] === 0x3B) break; // Trailer
                else i++;
            }

            return duration || 3000; // Fallback to 3 seconds
        } catch (err) {
            console.warn('Could not parse GIF duration:', err);
            return 5000; // Fallback to 5 seconds on error
        }
    };

    const viewProfile = async (adminId) => {
        // Clear any existing intro timeout to prevent race conditions
        if (introTimeoutRef.current) {
            clearTimeout(introTimeoutRef.current);
            introTimeoutRef.current = null;
        }

        // Find the admin to get their role for special loading animation
        const adminToLoad = admins.find(a => a._id === adminId);
        setLoadingAdminRole(adminToLoad?.role || null);
        setLoadingProfile(true);
        setShowProfileModal(true);
        setSelectedAdmin(null); // Clear previous data while loading
        setIntroRevealed(true); // Reset to visible by default
        setFirstLoopComplete(false); // Reset first loop tracking for new profile
        try {
            const response = await axios.get(`/admin/directory/${adminId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const adminData = response.data;

            // If admin has a GIF/file animation, hide avatar and reveal after GIF ends
            if (adminData.profileAnimation === 'file' && adminData.animationFileUrl) {
                setIntroRevealed(false); // Hide avatar during GIF animation
                setSelectedAdmin(adminData);

                // Detect actual GIF duration and reveal avatar after it ends
                getGifDuration(adminData.animationFileUrl).then(gifDuration => {
                    console.log('🎬 GIF duration detected:', gifDuration, 'ms - will reveal avatar after this');

                    // Set timeout to reveal avatar after GIF finishes
                    introTimeoutRef.current = setTimeout(() => {
                        console.log('✅ GIF finished - revealing avatar now');
                        setIntroRevealed(true);
                        introTimeoutRef.current = null;
                    }, gifDuration);
                });
            } else {
                // No GIF animation, show profile directly
                setSelectedAdmin(adminData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setShowProfileModal(false);
        } finally {
            setLoadingProfile(false);
            setLoadingAdminRole(null);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleDisplay(admin.role).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="ad-loading">
                <div className="ad-spinner"></div>
                <p>Loading admins...</p>
            </div>
        );
    }

    return (
        <div className="admin-directory">
            <div className="ad-header">
                <div className="ad-header-info">
                    <h1>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Admin Directory
                    </h1>
                    <p>View and connect with other team members</p>
                </div>
                <div className="ad-stats">
                    <span className="ad-stat-item">
                        <strong>{admins.length}</strong> Members
                    </span>
                </div>
            </div>

            <div className="ad-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="ad-grid">
                {filteredAdmins.map(admin => (
                    <div
                        key={admin._id}
                        className="ad-card"
                        onClick={() => viewProfile(admin._id)}
                    >
                        <div className="ad-card-header">
                            <div className="ad-avatar-wrapper" style={{
                                position: 'relative',
                                overflow: 'visible'
                            }}>
                                {/* Avatar Frame */}
                                {admin.avatarFrame && (
                                    <>
                                        {/* Check if custom frame is video */}
                                        {admin.avatarFrame === 'custom' && admin.customFrameUrl &&
                                            (admin.customFrameUrl.includes('.mp4') || admin.customFrameUrl.includes('.webm') || admin.customFrameUrl.includes('video')) ? (
                                            <video
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                style={{
                                                    position: 'absolute',
                                                    inset: '-4px',
                                                    width: 'calc(100% + 8px)',
                                                    height: 'calc(100% + 8px)',
                                                    borderRadius: '50%',
                                                    zIndex: 0,
                                                    objectFit: 'cover',
                                                    clipPath: 'circle(50%)'
                                                }}
                                                src={admin.customFrameUrl}
                                            />
                                        ) : (
                                            <div
                                                className={admin.avatarFrame !== 'custom' ? `ad-avatar-frame frame-${admin.avatarFrame}` : ''}
                                                style={{
                                                    position: 'absolute',
                                                    inset: '-4px',
                                                    borderRadius: '50%',
                                                    zIndex: 0,
                                                    clipPath: 'circle(50%)',
                                                    ...(admin.avatarFrame === 'custom' && admin.customFrameUrl ? {
                                                        backgroundImage: `url(${admin.customFrameUrl})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        animation: 'frameSpinAnimation 3s linear infinite'
                                                    } : {})
                                                }}
                                            ></div>
                                        )}
                                    </>
                                )}
                                <div
                                    className="ad-avatar"
                                    style={{
                                        ...(admin.profilePicture ? {
                                            background: `url(${admin.profilePicture}) center/cover no-repeat`
                                        } : { background: `linear-gradient(135deg, ${getRoleColor(admin.role)}, #764ba2)` }),
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {!admin.profilePicture && admin.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="ad-role-badge" style={{ background: getRoleColor(admin.role) }}>
                                {getRoleDisplay(admin.role)}
                            </div>
                        </div>

                        <div className="ad-card-body">
                            <h3>{admin.username}</h3>
                            <p className="ad-email">{admin.email}</p>
                            {admin.tags?.length > 0 && (
                                <div className="ad-tags">
                                    {admin.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="ad-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="ad-card-footer">
                            <button
                                className={`ad-like-btn ${admin.hasLiked ? 'liked' : ''}`}
                                onClick={(e) => handleLike(admin._id, e)}
                                disabled={admin._id === currentAdmin._id}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={admin.hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span>{admin.likeCount || 0}</span>
                            </button>
                            <span className="ad-view-hint">Click to view profile</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAdmins.length === 0 && (
                <div className="ad-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No admins found</p>
                </div>
            )}

            {/* Profile View Modal */}
            {showProfileModal && (
                <div className="ad-modal-overlay" onClick={() => !loadingProfile && setShowProfileModal(false)}>
                    <div className={`ad-modal ${selectedAdmin?.profileAnimation === 'file' ? 'has-gif-intro' : ''}`} onClick={e => e.stopPropagation()}>
                        {/* Close button - CSS hides it during intro animation */}
                        <button className="ad-modal-close" onClick={() => setShowProfileModal(false)} disabled={loadingProfile}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Loading State */}
                        {loadingProfile && (
                            <div className={`ad-modal-loading ${loadingAdminRole === 'super_admin' ? `super-admin-loading super-admin-${theme}` : ''}`}>
                                {loadingAdminRole === 'super_admin' ? (
                                    /* Special Futuristic Super Admin Loading Animation */
                                    <>
                                        <div className="sa-loading-container">
                                            {/* Hexagon grid background */}
                                            <div className="sa-hex-grid">
                                                {[...Array(7)].map((_, i) => (
                                                    <div key={i} className="sa-hexagon" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                                ))}
                                            </div>

                                            {/* Central orb with pulse */}
                                            <div className="sa-central-orb">
                                                <div className="sa-orb-core"></div>
                                                <div className="sa-orb-ring sa-ring-1"></div>
                                                <div className="sa-orb-ring sa-ring-2"></div>
                                                <div className="sa-orb-ring sa-ring-3"></div>
                                            </div>

                                            {/* Orbiting particles */}
                                            <div className="sa-orbit-container">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="sa-orbiting-particle" style={{ animationDelay: `${i * 0.3}s` }}></div>
                                                ))}
                                            </div>

                                            {/* Scanning line */}
                                            <div className="sa-scan-line"></div>

                                            {/* Crown icon */}
                                            <div className="sa-crown-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                                                    <path d="m5 16 2 4h10l2-4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="sa-loading-text">Accessing Super Admin...</p>
                                        <div className="sa-loading-bar">
                                            <div className="sa-loading-progress"></div>
                                        </div>
                                    </>
                                ) : (
                                    /* Regular loading animation */
                                    <>
                                        <div className="ad-modal-loading-spinner"></div>
                                        <p>Loading profile...</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Fullscreen GIF Intro Animation - Shows on TOP of everything first */}
                        {selectedAdmin && showIntroAnimation && (
                            <div
                                className="intro-animation-overlay"
                                onClick={() => setShowIntroAnimation(false)}
                            >
                                <div className="intro-animation-content">
                                    {selectedAdmin.animationFileUrl && (selectedAdmin.animationFileUrl.includes('video') ||
                                        selectedAdmin.animationFileUrl.endsWith('.mp4') ||
                                        selectedAdmin.animationFileUrl.endsWith('.webm')) ? (
                                        <video
                                            src={selectedAdmin.animationFileUrl}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="intro-animation-media"
                                        />
                                    ) : selectedAdmin.animationFileUrl ? (
                                        <img
                                            src={selectedAdmin.animationFileUrl}
                                            alt=""
                                            className="intro-animation-media"
                                        />
                                    ) : null}
                                </div>
                                <div className="intro-skip-hint">Click anywhere to skip</div>
                            </div>
                        )}

                        {/* Profile Content - only show when loaded AND intro animation is done */}
                        {selectedAdmin && !showIntroAnimation && (
                            <>
                                {/* Profile Animation Background */}
                                {selectedAdmin.profileAnimation && (
                                    <div className={`profile-animation-container profile-animation-${selectedAdmin.profileAnimation}`}>
                                        {/* Particle elements for animations */}
                                        {selectedAdmin.profileAnimation === 'sparkles' && (
                                            <>
                                                {[...Array(10)].map((_, i) => <div key={i} className="sparkle"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'fireworks' && (
                                            <>
                                                {[...Array(16)].map((_, i) => <div key={i} className="firework"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'rain' && (
                                            <>
                                                {[...Array(14)].map((_, i) => <div key={i} className="rain-drop"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'stars' && (
                                            <>
                                                {[...Array(12)].map((_, i) => <div key={i} className="star"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'confetti' && (
                                            <>
                                                {[...Array(20)].map((_, i) => <div key={i} className="confetti-piece"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'aurora' && (
                                            <>
                                                {[...Array(3)].map((_, i) => <div key={i} className="aurora-wave"></div>)}
                                                {[...Array(6)].map((_, i) => <div key={`p${i}`} className="aurora-particle"></div>)}
                                            </>
                                        )}
                                        {/* Premium Animations */}
                                        {selectedAdmin.profileAnimation === 'binary-rain' && (
                                            <>
                                                <link rel="stylesheet" href="/premium-animations/binary-rain.css" />
                                                {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'electric-arc' && (
                                            <>
                                                <link rel="stylesheet" href="/premium-animations/electric-arc.css" />
                                                {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'cyber-grid' && (
                                            <>
                                                <link rel="stylesheet" href="/premium-animations/cyber-grid.css" />
                                                {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                            </>
                                        )}
                                        {selectedAdmin.profileAnimation === 'hologram-scan' && (
                                            <>
                                                <link rel="stylesheet" href="/premium-animations/hologram-scan.css" />
                                                {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                            </>
                                        )}
                                        {/* Custom Animation */}
                                        {selectedAdmin.profileAnimation === 'custom' && selectedAdmin.customAnimationCss && (
                                            <>
                                                <style dangerouslySetInnerHTML={{
                                                    __html: selectedAdmin.customAnimationCss
                                                        .replace(/javascript\s*:/gi, '')
                                                        .replace(/expression\s*\(/gi, '')
                                                        .replace(/@import/gi, '')
                                                        .replace(/-moz-binding/gi, '')
                                                }} />
                                                {[...Array(12)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="custom-particle"
                                                        style={{
                                                            left: `${8 + (i * 7)}%`,
                                                            top: `${10 + (i % 4) * 20}%`,
                                                            animationDelay: `${i * 0.2}s`
                                                        }}
                                                    ></div>
                                                ))}
                                            </>
                                        )}
                                        {/* GIF/Video Animation (shows IN FRONT of content) */}
                                        {selectedAdmin.profileAnimation === 'file' && selectedAdmin.animationFileUrl && (
                                            <div
                                                id="fileAnimationContainer"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    overflow: 'hidden',
                                                    borderRadius: 'inherit',
                                                    zIndex: 50,
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                {selectedAdmin.animationFileUrl.includes('video') ||
                                                    selectedAdmin.animationFileUrl.endsWith('.mp4') ||
                                                    selectedAdmin.animationFileUrl.endsWith('.webm') ? (
                                                    <video
                                                        key={selectedAdmin._id + '-video-' + Date.now()}
                                                        src={selectedAdmin.animationFileUrl}
                                                        autoPlay
                                                        loop={selectedAdmin.animationLoopMode !== 'once'}
                                                        muted
                                                        playsInline
                                                        onEnded={(e) => {
                                                            if (selectedAdmin.animationLoopMode === 'once') {
                                                                // Fade out the video smoothly
                                                                e.target.style.transition = 'opacity 0.8s ease-out';
                                                                e.target.style.opacity = '0';

                                                                // Show fallback animation with fade in after video fades
                                                                setTimeout(() => {
                                                                    e.target.style.display = 'none';
                                                                    const container = document.getElementById('fallbackAnimationContainer');
                                                                    if (container) {
                                                                        container.style.opacity = '0';
                                                                        container.style.display = 'block';
                                                                        container.style.transition = 'opacity 0.8s ease-in';
                                                                        // Trigger reflow for animation
                                                                        container.offsetHeight;
                                                                        container.style.opacity = '1';
                                                                    }
                                                                }, 600);
                                                            } else if (selectedAdmin.animationLoopMode !== 'once' && !firstLoopComplete) {
                                                                // For looping mode: after first play, reduce opacity to 10%
                                                                setFirstLoopComplete(true);
                                                                e.target.style.transition = 'opacity 0.8s ease-out';
                                                                e.target.style.opacity = '0.1';
                                                            }
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            opacity: firstLoopComplete ? 0.1 : (selectedAdmin.animationOpacity || 0.7),
                                                            transition: 'opacity 0.8s ease-out'
                                                        }}
                                                    />
                                                ) : (
                                                    /* GIF with Play Once and Loop with opacity reduction support */
                                                    <img
                                                        key={selectedAdmin._id + '-img-' + (selectedAdmin.animationLoopMode || 'loop') + '-' + firstLoopComplete}
                                                        src={selectedAdmin.animationFileUrl}
                                                        alt=""
                                                        ref={(el) => {
                                                            if (!el) return;

                                                            // Function to parse GIF and get duration
                                                            const getGifDuration = async (url) => {
                                                                try {
                                                                    const response = await fetch(url);
                                                                    const buffer = await response.arrayBuffer();
                                                                    const data = new Uint8Array(buffer);

                                                                    let duration = 0;
                                                                    let i = 0;

                                                                    // Skip GIF header (6 bytes) + Logical Screen Descriptor (7 bytes)
                                                                    i = 13;

                                                                    // Check for Global Color Table
                                                                    const gctFlag = (data[10] & 0x80) >> 7;
                                                                    if (gctFlag) {
                                                                        const gctSize = Math.pow(2, (data[10] & 0x07) + 1) * 3;
                                                                        i += gctSize;
                                                                    }

                                                                    // Parse blocks
                                                                    while (i < data.length) {
                                                                        if (data[i] === 0x21) { // Extension block
                                                                            if (data[i + 1] === 0xF9) { // Graphics Control Extension
                                                                                const delay = (data[i + 4] | (data[i + 5] << 8)) * 10; // Convert to ms
                                                                                duration += delay || 100; // Default 100ms if 0
                                                                                i += 8;
                                                                            } else {
                                                                                i += 2;
                                                                                while (data[i] !== 0) {
                                                                                    i += data[i] + 1;
                                                                                }
                                                                                i++;
                                                                            }
                                                                        } else if (data[i] === 0x2C) { // Image block
                                                                            i += 10;
                                                                            const lctFlag = (data[i - 1] & 0x80) >> 7;
                                                                            if (lctFlag) {
                                                                                const lctSize = Math.pow(2, (data[i - 1] & 0x07) + 1) * 3;
                                                                                i += lctSize;
                                                                            }
                                                                            i++; // LZW minimum code size
                                                                            while (data[i] !== 0) {
                                                                                i += data[i] + 1;
                                                                            }
                                                                            i++;
                                                                        } else if (data[i] === 0x3B) { // Trailer
                                                                            break;
                                                                        } else {
                                                                            i++;
                                                                        }
                                                                    }

                                                                    return duration || 3000; // Fallback to 3 seconds
                                                                } catch (err) {
                                                                    console.warn('Could not parse GIF duration:', err);
                                                                    return 5000; // Fallback to 5 seconds on error
                                                                }
                                                            };

                                                            // For GIFs with "Play Once" mode
                                                            if (selectedAdmin.animationLoopMode === 'once' && !el.dataset.durationSet) {
                                                                el.dataset.durationSet = 'true';

                                                                getGifDuration(selectedAdmin.animationFileUrl).then(gifDuration => {
                                                                    console.log('GIF duration detected:', gifDuration, 'ms');

                                                                    const hideTimeout = setTimeout(() => {
                                                                        if (el) {
                                                                            el.style.transition = 'opacity 0.8s ease-out';
                                                                            el.style.opacity = '0';

                                                                            setTimeout(() => {
                                                                                el.style.display = 'none';
                                                                                const container = document.getElementById('fallbackAnimationContainer');
                                                                                if (container) {
                                                                                    container.style.opacity = '0';
                                                                                    container.style.display = 'block';
                                                                                    container.style.transition = 'opacity 0.8s ease-in';
                                                                                    container.offsetHeight;
                                                                                    container.style.opacity = '1';
                                                                                }
                                                                            }, 600);
                                                                        }
                                                                    }, gifDuration);

                                                                    el.dataset.timeoutId = hideTimeout;
                                                                });
                                                            }
                                                            // For looping GIFs: reduce opacity after first loop
                                                            else if (selectedAdmin.animationLoopMode !== 'once' && !firstLoopComplete && !el.dataset.loopTracked) {
                                                                el.dataset.loopTracked = 'true';

                                                                getGifDuration(selectedAdmin.animationFileUrl).then(gifDuration => {
                                                                    console.log('GIF loop duration:', gifDuration, 'ms - will fade to 10% after first loop');

                                                                    setTimeout(() => {
                                                                        setFirstLoopComplete(true);
                                                                        if (el) {
                                                                            el.style.transition = 'opacity 0.8s ease-out';
                                                                            el.style.opacity = '0.1';
                                                                        }
                                                                    }, gifDuration);
                                                                });
                                                            }
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            opacity: firstLoopComplete ? 0.1 : (selectedAdmin.animationOpacity || 0.7),
                                                            transition: 'opacity 0.8s ease-out'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {/* Fallback Animation Container (hidden initially, shown after file ends) */}
                                        {selectedAdmin.profileAnimation === 'file' && selectedAdmin.animationLoopMode === 'once' && selectedAdmin.animationAfterFile && (
                                            <div
                                                id="fallbackAnimationContainer"
                                                className={`profile-animation-${selectedAdmin.animationAfterFile}`}
                                                style={{
                                                    display: 'none',
                                                    opacity: 0,
                                                    transition: 'opacity 0.8s ease-in'
                                                }}
                                            >
                                                {selectedAdmin.animationAfterFile === 'sparkles' && [...Array(8)].map((_, i) => <div key={`s${i}`} className="sparkle"></div>)}
                                                {selectedAdmin.animationAfterFile === 'fireworks' && [...Array(6)].map((_, i) => <div key={`f${i}`} className="firework"></div>)}
                                                {selectedAdmin.animationAfterFile === 'rain' && [...Array(20)].map((_, i) => <div key={`r${i}`} className="rain-drop"></div>)}
                                                {selectedAdmin.animationAfterFile === 'stars' && [...Array(15)].map((_, i) => <div key={`st${i}`} className="star"></div>)}
                                                {selectedAdmin.animationAfterFile === 'confetti' && [...Array(12)].map((_, i) => <div key={`c${i}`} className="confetti-piece"></div>)}
                                                {selectedAdmin.animationAfterFile === 'aurora' && (
                                                    <>
                                                        {[...Array(3)].map((_, i) => <div key={`a${i}`} className="aurora-wave"></div>)}
                                                        {[...Array(6)].map((_, i) => <div key={`ap${i}`} className="aurora-particle"></div>)}
                                                    </>
                                                )}
                                                {/* Premium animations fallback */}
                                                {selectedAdmin.animationAfterFile === 'binary-rain' && (
                                                    <>
                                                        <link rel="stylesheet" href="/premium-animations/binary-rain.css" />
                                                        {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                                    </>
                                                )}
                                                {selectedAdmin.animationAfterFile === 'electric-arc' && (
                                                    <>
                                                        <link rel="stylesheet" href="/premium-animations/electric-arc.css" />
                                                        {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                                    </>
                                                )}
                                                {selectedAdmin.animationAfterFile === 'cyber-grid' && (
                                                    <>
                                                        <link rel="stylesheet" href="/premium-animations/cyber-grid.css" />
                                                        {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                                    </>
                                                )}
                                                {selectedAdmin.animationAfterFile === 'hologram-scan' && (
                                                    <>
                                                        <link rel="stylesheet" href="/premium-animations/hologram-scan.css" />
                                                        {[...Array(12)].map((_, i) => <div key={i} className="custom-particle"></div>)}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Modal Header - fades in after GIF animation ends */}
                                <div
                                    className="ad-modal-header"
                                    style={{
                                        opacity: introRevealed ? 1 : 0,
                                        visibility: introRevealed ? 'visible' : 'hidden',
                                        transition: 'opacity 0.5s ease-in, visibility 0.5s ease-in'
                                    }}
                                >
                                    <div className="ad-modal-avatar-wrapper" style={{
                                        position: 'relative',
                                        overflow: 'visible'
                                    }}>
                                        {/* Modal Avatar Frame */}
                                        {selectedAdmin.avatarFrame && (
                                            <>
                                                {/* Check if custom frame is a video */}
                                                {selectedAdmin.avatarFrame === 'custom' && selectedAdmin.customFrameUrl &&
                                                    (selectedAdmin.customFrameUrl.includes('.mp4') || selectedAdmin.customFrameUrl.includes('.webm') || selectedAdmin.customFrameUrl.includes('video')) ? (
                                                    <video
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        style={{
                                                            position: 'absolute',
                                                            inset: '-3px',
                                                            width: 'calc(100% + 6px)',
                                                            height: 'calc(100% + 6px)',
                                                            borderRadius: '50%',
                                                            zIndex: 0,
                                                            objectFit: 'cover',
                                                            clipPath: 'circle(50%)'
                                                        }}
                                                        src={selectedAdmin.customFrameUrl}
                                                    />
                                                ) : (
                                                    <div
                                                        className={selectedAdmin.avatarFrame !== 'custom' ? `ad-modal-avatar-frame frame-${selectedAdmin.avatarFrame}` : ''}
                                                        style={{
                                                            position: 'absolute',
                                                            inset: '-3px',
                                                            borderRadius: '50%',
                                                            zIndex: 0,
                                                            clipPath: 'circle(50%)',
                                                            ...(selectedAdmin.avatarFrame === 'custom' && selectedAdmin.customFrameUrl ? {
                                                                backgroundImage: `url(${selectedAdmin.customFrameUrl})`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                animation: 'frameSpinAnimation 3s linear infinite'
                                                            } : {})
                                                        }}
                                                    ></div>
                                                )}
                                            </>
                                        )}
                                        <div
                                            className="ad-modal-avatar"
                                            style={{
                                                ...(selectedAdmin.profilePicture ? {
                                                    background: `url(${selectedAdmin.profilePicture}) center/cover no-repeat`
                                                } : { background: `linear-gradient(135deg, ${getRoleColor(selectedAdmin.role)}, #764ba2)` }),
                                                position: 'relative',
                                                zIndex: 1
                                            }}
                                        >
                                            {!selectedAdmin.profilePicture && selectedAdmin.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <h2>{selectedAdmin.username}</h2>
                                    <p>{selectedAdmin.email}</p>
                                    <div className="ad-modal-role" style={{ background: getRoleColor(selectedAdmin.role) }}>
                                        {getRoleDisplay(selectedAdmin.role)}
                                    </div>
                                </div>

                                <div className="ad-modal-stats">
                                    <div className="ad-modal-stat">
                                        <span className="stat-value">{selectedAdmin.likeCount || 0}</span>
                                        <span className="stat-label">Likes</span>
                                    </div>
                                    <div className="ad-modal-stat">
                                        <span className="stat-value">{selectedAdmin.contributionCount || selectedAdmin.contributions?.length || 0}</span>
                                        <span className="stat-label">Contributions</span>
                                    </div>
                                    <div className="ad-modal-stat">
                                        <span className="stat-value">{new Date(selectedAdmin.createdAt).toLocaleDateString('en-IN')}</span>
                                        <span className="stat-label">Joined</span>
                                    </div>
                                </div>

                                {selectedAdmin._id !== currentAdmin._id && (
                                    <button
                                        className={`ad-modal-like-btn ${selectedAdmin.hasLiked ? 'liked' : ''}`}
                                        onClick={(e) => handleLike(selectedAdmin._id, e)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={selectedAdmin.hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        {selectedAdmin.hasLiked ? 'Liked' : 'Like'}
                                    </button>
                                )}

                                {/* Achievements Section */}
                                <div className="ad-achievements">
                                    <h3>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                        </svg>
                                        Achievements
                                    </h3>
                                    <div className="ad-achievements-grid">
                                        {/* Role Badge */}
                                        <div className="ad-achievement-item">
                                            <div className="ad-achievement-icon" style={{ background: getRoleColor(selectedAdmin.role) }}>
                                                {selectedAdmin.role === 'super_admin' ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" /><path d="m5 16 2 4h10l2-4" /></svg>
                                                ) : selectedAdmin.role === 'admin' ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                ) : selectedAdmin.role === 'vendor' ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                )}
                                            </div>
                                            <span className="ad-achievement-name">{getRoleDisplay(selectedAdmin.role)}</span>
                                            <span className="ad-achievement-desc">Role Badge</span>
                                        </div>

                                        {/* Contribution Badges */}
                                        {(selectedAdmin.contributionCount || 0) >= 100 && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #ffd700, #ffec8b)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 21h8m-4-4v4m-3-8l3-3 3 3M6 8l.001.009" /><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Century</span>
                                                <span className="ad-achievement-desc">100+ Contributions</span>
                                            </div>
                                        )}
                                        {(selectedAdmin.contributionCount || 0) >= 500 && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #ff6b35, #f7931e)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">On Fire</span>
                                                <span className="ad-achievement-desc">500+ Contributions</span>
                                            </div>
                                        )}
                                        {(selectedAdmin.contributionCount || 0) >= 1000 && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9l4-6z" /><path d="M11 3l1 6h6m-12 0h6l1-6" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Diamond</span>
                                                <span className="ad-achievement-desc">1000+ Contributions</span>
                                            </div>
                                        )}

                                        {/* Like Badges */}
                                        {(selectedAdmin.likeCount || 0) >= 10 && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Loved</span>
                                                <span className="ad-achievement-desc">10+ Likes</span>
                                            </div>
                                        )}
                                        {(selectedAdmin.likeCount || 0) >= 100 && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Popular</span>
                                                <span className="ad-achievement-desc">100+ Likes</span>
                                            </div>
                                        )}

                                        {/* Special Badges */}
                                        {selectedAdmin.avatarFrame && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #00d4ff, #9d4edd)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Stylist</span>
                                                <span className="ad-achievement-desc">Custom Frame</span>
                                            </div>
                                        )}
                                        {selectedAdmin.profilePicture && (
                                            <div className="ad-achievement-item">
                                                <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                                </div>
                                                <span className="ad-achievement-name">Photogenic</span>
                                                <span className="ad-achievement-desc">Profile Picture</span>
                                            </div>
                                        )}

                                        {/* Tenure Badge */}
                                        {(() => {
                                            const months = Math.floor((Date.now() - new Date(selectedAdmin.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
                                            if (months >= 12) return (
                                                <div className="ad-achievement-item">
                                                    <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 2v4m8-4v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>
                                                    </div>
                                                    <span className="ad-achievement-name">Veteran</span>
                                                    <span className="ad-achievement-desc">1+ Year</span>
                                                </div>
                                            );
                                            if (months >= 6) return (
                                                <div className="ad-achievement-item">
                                                    <div className="ad-achievement-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                    </div>
                                                    <span className="ad-achievement-name">Regular</span>
                                                    <span className="ad-achievement-desc">6+ Months</span>
                                                </div>
                                            );
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                {selectedAdmin.contributions?.length > 0 && (
                                    <div className="ad-modal-contributions">
                                        <h3>Recent Contributions</h3>
                                        <div className="ad-contributions-list">
                                            {selectedAdmin.contributions.slice(0, 5).map((c, idx) => (
                                                <div key={idx} className="ad-contribution-item">
                                                    <div className="ad-contribution-icon">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                                        </svg>
                                                    </div>
                                                    <div className="ad-contribution-info">
                                                        <span className="ad-contribution-desc">{c.description}</span>
                                                        <span className="ad-contribution-time">
                                                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDirectory;
