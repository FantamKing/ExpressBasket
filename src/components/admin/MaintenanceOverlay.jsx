import React from 'react';
import { Rocket, Mail } from 'lucide-react';
import './MaintenanceOverlay.css';

const MaintenanceOverlay = () => {
    return (
        <div className="mn-page">
            {/* Animated grid background */}
            <div className="mn-grid"></div>

            {/* Floating particles */}
            <div className="mn-particles">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="mn-particle" style={{
                        left: `${5 + i * 6}%`,
                        animationDelay: `${i * 0.5}s`
                    }}></div>
                ))}
            </div>

            {/* Server racks illustration */}
            <div className="mn-scene">
                <div className="mn-server-rack">
                    <div className="mn-server">
                        <div className="mn-server-lights">
                            <span className="mn-light mn-light-1"></span>
                            <span className="mn-light mn-light-2"></span>
                            <span className="mn-light mn-light-3"></span>
                        </div>
                        <div className="mn-server-lines">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div className="mn-server">
                        <div className="mn-server-lights">
                            <span className="mn-light mn-light-1"></span>
                            <span className="mn-light mn-light-2"></span>
                            <span className="mn-light mn-light-3"></span>
                        </div>
                        <div className="mn-server-lines">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div className="mn-server mn-server-fixing">
                        <div className="mn-server-lights">
                            <span className="mn-light mn-light-warning"></span>
                            <span className="mn-light mn-light-warning"></span>
                            <span className="mn-light mn-light-warning"></span>
                        </div>
                        <div className="mn-fixing-indicator">
                            <span>🔧</span>
                        </div>
                    </div>
                </div>

                {/* Connection lines */}
                <div className="mn-connections">
                    <div className="mn-conn-line"></div>
                    <div className="mn-conn-line"></div>
                    <div className="mn-conn-line"></div>
                </div>
            </div>

            {/* Progress section */}
            <div className="mn-progress-section">
                <div className="mn-progress-item">
                    <span className="mn-progress-label">Database</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-1"></div></div>
                </div>
                <div className="mn-progress-item">
                    <span className="mn-progress-label">Services</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-2"></div></div>
                </div>
                <div className="mn-progress-item">
                    <span className="mn-progress-label">Cache</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-3"></div></div>
                </div>
            </div>

            {/* Text content */}
            <div className="mn-content">
                <div className="mn-badge">
                    <span className="mn-badge-dot"></span>
                    System Maintenance
                </div>

                <h1 className="mn-title">We're Upgrading Our Servers</h1>

                <p className="mn-desc">
                    Our engineers are working to improve your experience.
                    <br />We'll be back online shortly.
                </p>

                <p className="mn-contact">
                    Need urgent help? Contact <strong>Super Admin</strong>
                </p>

                <div className="mn-footer">
                    <div className="mn-brand">
                        <Rocket size={20} />
                        Express Basket
                    </div>
                    <a href="mailto:expressbasket.help@gmail.com" className="mn-email">
                        <Mail size={14} />
                        expressbasket.help@gmail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceOverlay;
