import React from 'react';
import { Rocket, Mail, Wrench, Cog, Settings2 } from 'lucide-react';
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
                            <Wrench size={16} className="mn-wrench-icon" />
                        </div>
                    </div>
                </div>

                {/* Connection lines */}
                <div className="mn-connections">
                    {/* Fixing tools - positioned above connections area */}
                    <div className="mn-fixing-tools">
                        <div className="mn-tool-gear">
                            <Cog size={28} className="mn-gear-icon" />
                        </div>
                        <div className="mn-tool-wrench">
                            <Settings2 size={20} className="mn-settings-icon" />
                        </div>
                    </div>
                    <div className="mn-conn-line"></div>
                    <div className="mn-conn-line"></div>
                    <div className="mn-conn-line"></div>
                </div>
            </div>

            {/* Progress section */}
            <div className="mn-progress-section mn-status-override">
                <div className="mn-progress-item mn-status-item">
                    <span className="mn-progress-label mn-progress-label mn-status-label" style={{ color: '#a1a1aa' }}>DATABASE</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-1"></div></div>
                </div>
                <div className="mn-progress-item mn-status-item">
                    <span className="mn-progress-label mn-progress-label mn-status-label" style={{ color: '#a1a1aa' }}>SERVICES</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-2"></div></div>
                </div>
                <div className="mn-progress-item mn-status-item">
                    <span className="mn-progress-label mn-progress-label mn-status-label" style={{ color: '#a1a1aa' }}>CACHE</span>
                    <div className="mn-progress-bar"><div className="mn-progress-fill mn-fill-3"></div></div>
                </div>
            </div>

            {/* Text content */}
            <div className="mn-content mn-status-content">
                <div className="mn-badge mn-badge mn-status-badge">
                    <span className="mn-badge-dot"></span>
                    System Maintenance
                </div>

                <h1 className="mn-title mn-title mn-status-title" style={{ color: '#fafafa' }}>We're Upgrading Our Servers</h1>

                <p className="mn-desc mn-desc mn-status-desc" style={{ color: '#a1a1aa' }}>
                    Our engineers are working to improve your experience.
                    <br />We'll be back online shortly.
                </p>

                <p className="mn-contact mn-contact mn-status-contact" style={{ color: '#a1a1aa' }}>
                    Need urgent help? Contact <strong style={{ color: '#10b981' }}>Super Admin</strong>
                </p>

                <div className="mn-footer mn-status-footer">
                    <div className="mn-brand mn-brand mn-status-brand" style={{ color: '#fafafa' }}>
                        <Rocket size={20} style={{ color: '#10b981' }} />
                        Express Basket
                    </div>
                    <a href="mailto:expressbasket.help@gmail.com" className="mn-email mn-status-email">
                        <Mail size={14} />
                        expressbasket.help@gmail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceOverlay;
