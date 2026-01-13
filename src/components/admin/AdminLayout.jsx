import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { hasPermission } from './ProtectedAdminRoute.jsx';
import './AdminLayout.css';

// Lucide-style SVG Icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const CategoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="logout-icon-animated" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const RocketIcon = () => (
  <svg className="sidebar-logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// Snowflake component for animation
const Snowfall = () => (
  <div className="snowfall">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="snowflake">❄</div>
    ))}
  </div>
);

// User Profile Icon
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // For active route detection
  const { theme, toggleTheme } = useTheme();

  // Get current admin from localStorage
  const [admin, setAdmin] = React.useState(null);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [editingName, setEditingName] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('profile'); // profile, contributions, mail

  // Notification badges state
  const [notifications, setNotifications] = React.useState({
    orders: 0,
    support: 0,
    faceRequests: 0,
    users: 0,
    deliveryPartners: 0
  });

  // Contributions state
  const [contributions, setContributions] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [loadingContributions, setLoadingContributions] = React.useState(false);
  const [allAdmins, setAllAdmins] = React.useState([]);
  const [selectedAdminId, setSelectedAdminId] = React.useState('');
  const [viewingAll, setViewingAll] = React.useState(false);

  // Date range for contributions (default last 7 days)
  const getDefaultDates = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };
  const [dateRange, setDateRange] = React.useState(getDefaultDates());
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  // Custom frame upload progress state
  const [frameUploadProgress, setFrameUploadProgress] = React.useState(0);
  const [isUploadingFrame, setIsUploadingFrame] = React.useState(false);

  // Profile picture state with crop modal
  const [uploadingPicture, setUploadingPicture] = React.useState(false);
  const [showCropModal, setShowCropModal] = React.useState(false);
  const [cropImage, setCropImage] = React.useState(null);
  const [cropZoom, setCropZoom] = React.useState(1);
  const [cropPosition, setCropPosition] = React.useState({ x: 0, y: 0 });
  const fileInputRef = React.useRef(null);
  const cropCanvasRef = React.useRef(null);
  const cropImageRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  // Handle file selection - open crop modal (or upload directly for GIFs)
  const handleFileSelect = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and GIF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // For GIFs, upload directly without cropping (Cloudinary handles server-side crop)
    if (file.type === 'image/gif') {
      setUploadingPicture(true);
      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/picture`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await response.json();
        if (response.ok) {
          const updatedAdmin = { ...admin, profilePicture: data.profilePicture };
          setAdmin(updatedAdmin);
          localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        } else {
          alert(data.message || 'Failed to upload');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload GIF');
      } finally {
        setUploadingPicture(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    // For other images, open crop modal
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target.result);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle mouse/touch events for dragging
  const handleCropMouseDown = (e) => {
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - cropPosition.x, y: clientY - cropPosition.y };
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCropPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handleCropMouseUp = () => {
    isDragging.current = false;
  };

  // Crop and upload the image
  const handleCropConfirm = async () => {
    if (!cropImageRef.current) return;

    setUploadingPicture(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 300; // Output size
      canvas.width = size;
      canvas.height = size;

      const img = cropImageRef.current;
      const scale = cropZoom;
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;

      // Calculate crop area (center of 200x200 preview)
      const previewSize = 200;
      const offsetX = (previewSize / 2) + cropPosition.x - (imgWidth / 2);
      const offsetY = (previewSize / 2) + cropPosition.y - (imgHeight / 2);

      // Draw scaled and positioned image
      const drawX = (size / previewSize) * offsetX;
      const drawY = (size / previewSize) * offsetY;
      const drawW = (size / previewSize) * imgWidth;
      const drawH = (size / previewSize) * imgHeight;

      // Create circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const formData = new FormData();
      formData.append('profilePicture', blob, 'profile.jpg');

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        const updatedAdmin = { ...admin, profilePicture: data.profilePicture };
        setAdmin(updatedAdmin);
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        setShowCropModal(false);
        setCropImage(null);
      } else {
        alert(data.message || 'Failed to upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCropImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProfilePicture = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/picture`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedAdmin = { ...admin, profilePicture: null };
        setAdmin(updatedAdmin);
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      }
    } catch (error) {
      console.error('Remove error:', error);
    }
  };

  React.useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        console.error('Failed to parse admin data');
      }
    }
  }, []);

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Fetch notification counts
  const fetchNotifications = React.useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // Fetch pending orders count
      const ordersRes = await fetch(`${baseUrl}/orders/pending-count`, { headers }).catch(() => null);
      const ordersData = ordersRes?.ok ? await ordersRes.json() : { count: 0 };

      // Fetch pending support tickets count
      const supportRes = await fetch(`${baseUrl}/support/pending-count`, { headers }).catch(() => null);
      const supportData = supportRes?.ok ? await supportRes.json() : { count: 0 };

      // Fetch pending face registration requests (super admin only)
      const faceRes = await fetch(`${baseUrl}/admin/face-recognition/pending-count`, { headers }).catch(() => null);
      const faceData = faceRes?.ok ? await faceRes.json() : { count: 0 };

      setNotifications({
        orders: ordersData.count || 0,
        support: supportData.count || 0,
        faceRequests: faceData.count || 0,
        users: 0,
        deliveryPartners: 0
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Fetch notifications on mount and every 30 seconds
  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Session validation state
  const [sessionExpired, setSessionExpired] = React.useState(false);

  // Validate admin session periodically
  React.useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/validate-session`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const data = await response.json();
          if (data.code === 'SESSION_EXPIRED') {
            setSessionExpired(true);
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
          }
        }
      } catch (error) {
        // Network error - don't logout
      }
    };

    // Check immediately and every 30 seconds
    validateSession();
    const interval = setInterval(validateSession, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle session expired - redirect to login
  React.useEffect(() => {
    if (sessionExpired) {
      const timer = setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, navigate]);

  // Clear admin session when navigating away from admin panel
  React.useEffect(() => {
    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      const hasAdminToken = localStorage.getItem('adminToken');

      // If user is on admin route but has no token (session was cleared), redirect to login
      if (currentPath.startsWith('/admin') && currentPath !== '/admin' && !hasAdminToken) {
        navigate('/admin', { replace: true });
        return;
      }

      // If user navigates away from /admin routes, clear session
      if (!currentPath.startsWith('/admin')) {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
      }
    };

    // Check on mount and on popstate
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  // Get role display name
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

  const openProfile = () => {
    setNewUsername(admin?.username || '');
    setActiveTab('profile');
    setEditingName(false);
    setShowProfileModal(true);
  };

  const handleUpdateName = async () => {
    if (!newUsername.trim()) return;

    // For now, just update locally (you can add API call later)
    const updatedAdmin = { ...admin, username: newUsername.trim() };
    setAdmin(updatedAdmin);
    localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    setEditingName(false);
  };

  const fetchContributions = async (viewAll = false, adminIdFilter = '') => {
    setLoadingContributions(true);
    try {
      const token = localStorage.getItem('adminToken');
      let url = viewAll ? '/admin/contributions/all' : '/admin/contributions/me';
      const params = new URLSearchParams();
      if (adminIdFilter) params.append('adminId', adminIdFilter);
      if (dateRange.from) params.append('fromDate', dateRange.from);
      if (dateRange.to) params.append('toDate', dateRange.to);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setContributions(data.contributions || []);
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    } finally {
      setLoadingContributions(false);
    }
  };

  const fetchAllAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/contributions/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAllAdmins(data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  // Export contributions as CSV
  const exportToCSV = () => {
    if (contributions.length === 0) {
      alert('No contributions to export');
      return;
    }

    // Simple date format that Excel handles well
    const formatDateForExcel = (dateStr) => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `${date} ${time}`;
    };

    const headers = ['DateTime', 'Action', 'Description', 'Admin'];
    const rows = contributions.map(c => [
      formatDateForExcel(c.createdAt),
      (c.action || 'N/A').replace(/_/g, ' '),
      (c.description || 'No description').replace(/,/g, ';').replace(/"/g, "'"),
      c.admin?.username || admin?.username || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions_${dateRange.from}_to_${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export contributions as PDF (simple HTML to print/PDF)
  const exportToPDF = () => {
    if (contributions.length === 0) {
      alert('No contributions to export');
      return;
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        return new Date(dateStr).toLocaleString('en-IN');
      } catch {
        return 'N/A';
      }
    };

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contributions Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px; }
          .info { color: #666; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #28a745; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Contributions Report</h1>
        <p class="info"><strong>Period:</strong> ${dateRange.from} to ${dateRange.to}</p>
        <p class="info"><strong>Total Activities:</strong> ${contributions.length}</p>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Description</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            ${contributions.map(c => `
              <tr>
                <td>${formatDate(c.createdAt)}</td>
                <td>${(c.action || 'N/A').replace(/_/g, ' ')}</td>
                <td>${c.description || 'No description'}</td>
                <td>${c.admin?.username || admin?.username || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="footer">Generated on ${new Date().toLocaleString('en-IN')}</p>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    setShowExportMenu(false);
  };

  // Fetch contributions when tab changes to contributions
  React.useEffect(() => {
    if (activeTab === 'contributions' && showProfileModal) {
      fetchContributions(viewingAll, selectedAdminId);
      if (admin?.role === 'super_admin') {
        fetchAllAdmins();
      }
    }
  }, [activeTab, showProfileModal, viewingAll, selectedAdminId]);

  return (
    <div className="admin-layout">
      {/* Snowfall Background */}
      <Snowfall />

      {/* Session Expired Alert */}
      {sessionExpired && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#1a1a2e',
            padding: '30px 40px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            maxWidth: '420px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 12px',
              color: '#fff',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Session Expired
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
              Your admin account was logged in from another location. You will be redirected to the login page.
            </p>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        {/* Mobile Profile Bar - shown only on mobile, before navigation */}
        <div className="mobile-profile-bar">
          {admin && (
            <>
              {/* Left side: Avatar + Info */}
              <div className="mobile-profile-left">
                {/* Mobile Avatar with Frame Wrapper */}
                <div className="mobile-avatar-wrapper" style={{
                  position: 'relative',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {/* Avatar Frame */}
                  {admin.avatarFrame && (
                    <div
                      className={admin.avatarFrame !== 'custom' ? `header-avatar-frame frame-${admin.avatarFrame}` : ''}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        zIndex: 0,
                        transformOrigin: 'center center',
                        ...(admin.avatarFrame === 'custom' && admin.customFrameUrl ? {
                          backgroundImage: `url(${admin.customFrameUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          animation: 'frameSpinAnimation 3s linear infinite'
                        } : {})
                      }}
                    ></div>
                  )}
                  {/* Avatar */}
                  <div
                    className="mobile-profile-avatar"
                    onClick={openProfile}
                    style={{
                      width: '26px',
                      height: '26px',
                      minWidth: '26px',
                      minHeight: '26px',
                      position: 'relative',
                      zIndex: 1,
                      borderRadius: '50%',
                      ...(admin.profilePicture ? {
                        backgroundImage: `url(${admin.profilePicture})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {})
                    }}
                  >
                    {!admin.profilePicture && (admin.username ? admin.username.charAt(0).toUpperCase() : 'A')}
                  </div>
                </div>
                <div className="mobile-profile-info" onClick={openProfile}>
                  <span className="mobile-profile-name">{admin.username || 'Admin'}</span>
                  <span className={`mobile-profile-role role-${admin.role}`}>
                    {getRoleDisplay(admin.role)}
                  </span>
                </div>
              </div>

              {/* Admin Panel Title with Rocket */}
              <div className="mobile-admin-title">
                <svg className="mobile-rocket-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
                <span>Admin Panel</span>
              </div>

              <button
                className="mobile-theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        <div className="sidebar-header">
          <h2>
            <RocketIcon />
            Admin Panel
          </h2>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard - accessible to all */}
          <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            <DashboardIcon />
            <span>Dashboard</span>
          </Link>

          {/* Products - requires manage_products permission */}
          {hasPermission(admin, 'manage_products') && (
            <Link to="/admin/products" className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`}>
              <ProductIcon />
              <span>Products</span>
            </Link>
          )}

          {/* Categories - requires manage_categories permission */}
          {hasPermission(admin, 'manage_categories') && (
            <Link to="/admin/categories" className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}>
              <CategoryIcon />
              <span>Categories</span>
            </Link>
          )}

          {/* Orders - requires manage_orders permission */}
          {hasPermission(admin, 'manage_orders') && (
            <Link to="/admin/orders" className={`nav-item ${isActive('/admin/orders') ? 'active' : ''}`}>
              <OrderIcon />
              <span>Orders</span>
              {notifications.orders > 0 && <span className="nav-badge">{notifications.orders}</span>}
            </Link>
          )}

          {/* Orders Map - requires manage_orders_map permission */}
          {hasPermission(admin, 'manage_orders_map') && (
            <Link to="/admin/orders-map" className={`nav-item ${isActive('/admin/orders-map') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Orders Map</span>
            </Link>
          )}

          {/* Delivery Partners - requires manage_delivery_partners permission */}
          {hasPermission(admin, 'manage_delivery_partners') && (
            <Link to="/admin/delivery-partners" className={`nav-item ${isActive('/admin/delivery-partners') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path>
              </svg>
              <span>Delivery Partners</span>
            </Link>
          )}

          {/* Delivery Issues - requires manage_delivery_issues permission */}
          {hasPermission(admin, 'manage_delivery_issues') && (
            <Link to="/admin/delivery-issues" className={`nav-item ${isActive('/admin/delivery-issues') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Delivery Issues</span>
            </Link>
          )}

          {/* Users - requires manage_users permission, hidden from normal_viewer, disabled for special_viewer */}
          {hasPermission(admin, 'manage_users') && admin?.role !== 'normal_viewer' && (
            admin?.role === 'special_viewer' ? (
              <div className="nav-item disabled" title="View only - No access to user data" onClick={(e) => e.preventDefault()}>
                <UsersIcon />
                <span>Users</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            ) : (
              <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                <UsersIcon />
                <span>Users</span>
              </Link>
            )
          )}

          {/* Support Requests - requires manage_support permission */}
          {hasPermission(admin, 'manage_support') && (
            <Link to="/admin/support" className={`nav-item ${isActive('/admin/support') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <span>Support</span>
              {notifications.support > 0 && <span className="nav-badge">{notifications.support}</span>}
            </Link>
          )}

          {/* Manage Admins - requires manage_admins permission */}
          {hasPermission(admin, 'manage_admins') && (
            <Link to="/admin/admins" className={`nav-item ${isActive('/admin/admins') ? 'active' : ''}`}>
              <SettingsIcon />
              <span>Manage Admins</span>
            </Link>
          )}

          {/* Admin Directory - View all admins */}
          <Link to="/admin/directory" className={`nav-item ${isActive('/admin/directory') ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Admin Directory</span>
          </Link>

          {/* Face Recognition Management - Super Admin only */}
          {admin?.role === 'super_admin' && (
            <Link to="/admin/face-recognition" className={`nav-item ${isActive('/admin/face-recognition') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <span>Face Recognition</span>
              {notifications.faceRequests > 0 && <span className="nav-badge">{notifications.faceRequests}</span>}
            </Link>
          )}

          {/* My Face ID - For regular admins to register/manage their own face */}
          {admin?.role !== 'super_admin' && (
            <Link to="/admin/request-face-registration" className={`nav-item ${isActive('/admin/request-face-registration') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <span>My Face ID</span>
            </Link>
          )}

          {/* Memberships - requires manage_memberships permission */}
          {hasPermission(admin, 'manage_memberships') && (
            <Link to="/admin/memberships" className={`nav-item ${isActive('/admin/memberships') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>Memberships</span>
            </Link>
          )}

          {/* Wallets - requires manage_wallets permission */}
          {hasPermission(admin, 'manage_wallets') && (
            <Link to="/admin/wallets" className={`nav-item ${isActive('/admin/wallets') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>Wallets</span>
            </Link>
          )}

          {/* Mail Center - requires manage_mails permission */}
          {hasPermission(admin, 'manage_mails') && (
            <Link to="/admin/mails" className={`nav-item ${isActive('/admin/mails') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Mail Center</span>
            </Link>
          )}

          {/* Tracking Toggle - requires manage_tracking permission */}
          {hasPermission(admin, 'manage_tracking') && (
            <Link to="/admin/tracking-toggle" className={`nav-item ${isActive('/admin/tracking-toggle') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Tracking Toggle</span>
            </Link>
          )}

          {/* Server - requires manage_server permission */}
          {hasPermission(admin, 'manage_server') && (
            <Link to="/admin/server" className={`nav-item server-nav-item ${isActive('/admin/server') ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
              <span>Server</span>
            </Link>
          )}

          <button onClick={handleLogout} className="nav-item logout-btn-animated">
            <svg className="logout-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </aside >

      <main className="admin-main">
        <header className="admin-header">
          <h1>
            <RocketIcon />
            Express Basket Admin
          </h1>

          <div className="header-right">
            {/* Admin Profile Section */}
            {admin && (
              <div className="admin-profile" onClick={openProfile} style={{ cursor: 'pointer' }} title="Click to view profile">
                <div className="profile-avatar-wrapper" style={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Animated Avatar Frame */}
                  {admin.avatarFrame && (
                    <div
                      className={admin.avatarFrame !== 'custom' ? `header-avatar-frame frame-${admin.avatarFrame}` : ''}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        zIndex: 0,
                        transformOrigin: 'center center',
                        ...(admin.avatarFrame === 'custom' && admin.customFrameUrl ? {
                          backgroundImage: `url(${admin.customFrameUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          animation: 'frameSpinAnimation 3s linear infinite'
                        } : {})
                      }}
                    ></div>
                  )}
                  <div
                    className="profile-avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundImage: admin.profilePicture ? `url(${admin.profilePicture})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      position: 'relative',
                      zIndex: 1,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {!admin.profilePicture && (admin.username ? admin.username.charAt(0).toUpperCase() : 'A')}
                  </div>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{admin.username || 'Admin'}</span>
                  <span className="profile-email">{admin.email}</span>
                </div>
                <span className={`profile-role role-${admin.role}`}>
                  {getRoleDisplay(admin.role)}
                </span>
              </div>
            )}

            {/* Animated Theme Toggle with Lucide Icons */}
            <button
              className="admin-theme-toggle-new"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="toggle-icons">
                {/* Sun Icon */}
                <svg
                  className={`theme-icon sun ${theme === 'light' ? 'active' : ''}`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                {/* Moon Icon */}
                <svg
                  className={`theme-icon moon ${theme === 'dark' ? 'active' : ''}`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
            </button>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>

      {/* Profile Modal */}
      {
        showProfileModal && (
          <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h2>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Admin Profile
                </h2>
                <button className="close-btn" onClick={() => setShowProfileModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Profile Tabs */}
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </button>
                <button
                  className={`profile-tab ${activeTab === 'contributions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contributions')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Contributions
                </button>
                <button
                  className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('achievements')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                  </svg>
                  Achievements
                </button>
                <button
                  className={`profile-tab ${activeTab === 'frames' ? 'active' : ''}`}
                  onClick={() => setActiveTab('frames')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                  Avatar Frames
                </button>
                <button
                  className={`profile-tab ${activeTab === 'mail' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mail')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Mail
                </button>
              </div>

              <div className="profile-modal-content">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="profile-tab-content">
                    <div className="profile-card">
                      {/* Profile Picture with Upload */}
                      <div className="profile-avatar-container">
                        <div
                          className="profile-avatar-large"
                          style={{
                            backgroundImage: admin?.profilePicture ? `url(${admin.profilePicture})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {!admin?.profilePicture && (admin?.username ? admin.username.charAt(0).toUpperCase() : 'A')}
                          <div className="avatar-overlay">
                            {uploadingPicture ? (
                              <div className="upload-spinner"></div>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                              </svg>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                        />
                        {admin?.profilePicture && (
                          <button className="remove-avatar-btn" onClick={removeProfilePicture}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Logout Button - Under Avatar */}
                      <button className="profile-avatar-logout-btn" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>

                      <div className="profile-details">
                        <div className="profile-field">
                          <label>Name</label>
                          {editingName ? (
                            <div className="edit-field">
                              <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                autoFocus
                              />
                              <button className="save-btn" onClick={handleUpdateName}>Save</button>
                              <button className="cancel-btn" onClick={() => setEditingName(false)}>Cancel</button>
                            </div>
                          ) : (
                            <div className="field-value">
                              <span>{admin?.username || 'Admin'}</span>
                              <button className="edit-icon-btn" onClick={() => setEditingName(true)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="profile-field">
                          <label>Email</label>
                          <div className="field-value">{admin?.email}</div>
                        </div>

                        <div className="profile-field">
                          <label>Role</label>
                          <span className={`role-badge role-${admin?.role}`}>
                            {getRoleDisplay(admin?.role)}
                          </span>
                        </div>

                        <div className="profile-field">
                          <label>Permissions</label>
                          <div className="permissions-list">
                            {admin?.permissions?.map((perm, idx) => (
                              <span key={idx} className="permission-tag">{perm.replace(/_/g, ' ')}</span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Contributions Tab */}
                {activeTab === 'contributions' && (
                  <div className="profile-tab-content">
                    <div className="contributions-section">
                      {/* Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ margin: 0 }}>{viewingAll ? 'All Contributions' : 'Your Contributions'}</h3>
                        {admin?.role === 'super_admin' && (
                          <button
                            onClick={() => { setViewingAll(!viewingAll); setSelectedAdminId(''); }}
                            style={{
                              padding: '8px 16px',
                              background: viewingAll ? 'var(--btn-primary)' : 'var(--nav-link-hover)',
                              color: viewingAll ? 'white' : 'var(--text-color)',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {viewingAll ? 'View Mine' : 'View All Admins'}
                          </button>
                        )}
                      </div>

                      {/* Date Range & Filter Row */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        marginBottom: '16px',
                        padding: '14px',
                        background: 'var(--nav-link-hover)',
                        borderRadius: '10px',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>From:</label>
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '12px'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>To:</label>
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '12px'
                            }}
                          />
                        </div>

                        {viewingAll && (
                          <select
                            value={selectedAdminId}
                            onChange={(e) => setSelectedAdminId(e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '12px'
                            }}
                          >
                            <option value="">All Admins</option>
                            {allAdmins.map(a => (
                              <option key={a._id} value={a._id}>{a.username}</option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => fetchContributions(viewingAll, selectedAdminId)}
                          style={{
                            padding: '8px 16px',
                            background: 'var(--btn-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Apply Filter
                        </button>

                        {/* Export Dropdown */}
                        <div style={{ position: 'relative', marginLeft: 'auto' }}>
                          <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export
                          </button>
                          {showExportMenu && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: '4px',
                              background: 'var(--card-bg)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              zIndex: 100,
                              minWidth: '140px',
                              overflow: 'hidden'
                            }}>
                              <button
                                onClick={exportToPDF}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-color)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'var(--nav-link-hover)'}
                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Export as PDF
                              </button>
                              <button
                                onClick={exportToCSV}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-color)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'var(--nav-link-hover)'}
                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                                Export as Excel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {loadingContributions ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
                      ) : (
                        <>
                          {/* Simple Bar Chart with horizontal scroll */}
                          <div style={{
                            background: 'var(--nav-link-hover)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                          }}>
                            <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-secondary)' }}>Activity Chart</p>
                            <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                height: '100px',
                                gap: '6px',
                                minWidth: chartData.length > 7 ? `${chartData.length * 45}px` : '100%'
                              }}>
                                {chartData.map((day, idx) => {
                                  const maxCount = Math.max(...chartData.map(d => d.count), 1);
                                  const height = (day.count / maxCount) * 100;
                                  return (
                                    <div key={idx} style={{
                                      flex: chartData.length <= 7 ? 1 : 'none',
                                      width: chartData.length > 7 ? '40px' : 'auto',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center'
                                    }}>
                                      <span style={{ fontSize: '10px', color: 'var(--text-color)', marginBottom: '4px' }}>{day.count}</span>
                                      <div style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        minHeight: '4px',
                                        background: 'linear-gradient(180deg, var(--btn-primary), #764ba2)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.3s ease'
                                      }}></div>
                                      <span style={{ fontSize: '8px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Total: {contributions.length} activities
                          </p>

                          {/* Activity List */}
                          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {contributions.length === 0 ? (
                              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>No activities yet</p>
                            ) : (
                              contributions.slice(0, 15).map((c, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  marginBottom: '8px',
                                  background: 'var(--nav-link-hover)'
                                }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--btn-primary), #764ba2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                    </svg>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {c.description}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                      {new Date(c.createdAt).toLocaleString('en-IN')}
                                      {c.admin?.username && viewingAll && ` • ${c.admin.username}`}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Mail Tab */}
                {activeTab === 'mail' && (
                  <div className="profile-tab-content">
                    <div className="mail-section">
                      <h3>Admin Mail</h3>
                      {admin?.role === 'super_admin' ? (
                        <div className="mail-actions">
                          <p>As a Super Admin, you can send mails to users from the Mail Center.</p>
                          <Link
                            to="/admin/mails"
                            className="mail-center-btn"
                            onClick={() => setShowProfileModal(false)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Go to Mail Center
                          </Link>
                        </div>
                      ) : (
                        <div className="mail-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          <p>Mail features are available for Super Admins only.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div className="profile-tab-content">
                    <div className="achievements-section">
                      <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <circle cx="12" cy="8" r="6"></circle>
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                        Your Achievements
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '12px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '4px'
                      }}>
                        {[
                          { id: 'first_login', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, name: 'First Login', desc: 'Welcome aboard!', unlocked: true },
                          { id: 'product_master', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, name: 'Product Master', desc: 'Added 50+ products', unlocked: admin?.role === 'super_admin' },
                          { id: 'category_king', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>, name: 'Category King', desc: 'Created 10+ categories', unlocked: admin?.role === 'super_admin' },
                          { id: 'order_champion', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>, name: 'Order Champion', desc: 'Processed 100+ orders', unlocked: false },
                          { id: 'support_hero', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, name: 'Support Hero', desc: 'Resolved 50+ tickets', unlocked: false },
                          { id: 'team_builder', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, name: 'Team Builder', desc: 'Added 5+ admins', unlocked: admin?.role === 'super_admin' },
                          { id: 'speed_demon', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, name: 'Speed Demon', desc: '10 orders in 1 day', unlocked: false },
                          { id: 'early_bird', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>, name: 'Early Bird', desc: 'Logged in before 6 AM', unlocked: false },
                          { id: 'night_owl', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>, name: 'Night Owl', desc: 'Logged in after midnight', unlocked: true },
                          { id: 'streak_master', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>, name: 'Streak Master', desc: '7-day login streak', unlocked: false },
                          { id: 'veteran', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, name: 'Veteran', desc: '1 month as admin', unlocked: true },
                          { id: 'legend', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>, name: 'Legend', desc: '6 months as admin', unlocked: admin?.role === 'super_admin' }
                        ].map(achievement => (
                          <div
                            key={achievement.id}
                            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                            style={{
                              background: achievement.unlocked
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))'
                                : 'var(--nav-link-hover)',
                              border: achievement.unlocked
                                ? '1px solid rgba(102, 126, 234, 0.3)'
                                : '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '16px 12px',
                              textAlign: 'center',
                              opacity: achievement.unlocked ? 1 : 0.5,
                              filter: achievement.unlocked ? 'none' : 'grayscale(1)',
                              transition: 'all 0.3s ease',
                              cursor: 'default',
                              position: 'relative'
                            }}
                          >
                            {!achievement.unlocked && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </div>
                            )}
                            <div style={{ marginBottom: '8px', color: achievement.unlocked ? 'var(--btn-primary)' : 'var(--text-secondary)' }}>{achievement.icon}</div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '4px' }}>
                              {achievement.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {achievement.desc}
                            </div>
                            {achievement.unlocked && (
                              <div style={{
                                marginTop: '8px',
                                fontSize: '10px',
                                color: '#10b981',
                                fontWeight: '600'
                              }}>✓ UNLOCKED</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Avatar Frames Tab */}
                {activeTab === 'frames' && (
                  <div className="profile-tab-content">
                    <div className="frames-section">
                      <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="6"></circle>
                        </svg>
                        Avatar Frames
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Select an animated frame to decorate your avatar
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '16px',
                        maxHeight: '350px',
                        overflowY: 'auto',
                        padding: '4px'
                      }}>
                        {/* No Frame Option */}
                        <div
                          className={`frame-option ${!admin?.avatarFrame ? 'selected' : ''}`}
                          onClick={async () => {
                            const token = localStorage.getItem('adminToken');
                            try {
                              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/frame`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ frame: null })
                              });
                              const data = await res.json();
                              if (data.success) {
                                const updatedAdmin = { ...admin, avatarFrame: data.avatarFrame, customFrameUrl: data.customFrameUrl };
                                setAdmin(updatedAdmin);
                                localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                              }
                            } catch (e) { console.error(e); }
                          }}
                          style={{
                            background: !admin?.avatarFrame ? 'linear-gradient(135deg, var(--btn-primary), #764ba2)' : 'var(--nav-link-hover)',
                            border: !admin?.avatarFrame ? '2px solid var(--btn-primary)' : '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'var(--bg-color)',
                            margin: '0 auto 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {admin?.profilePicture ? (
                              <img src={admin.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              admin?.username?.charAt(0).toUpperCase() || 'A'
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-color)' }}>None</div>
                        </div>

                        {/* Custom Frame as First Option (if uploaded) */}
                        {admin?.customFrameUrl && (
                          <div
                            className={`frame-option ${admin?.avatarFrame === 'custom' ? 'selected' : ''}`}
                            onClick={async () => {
                              const token = localStorage.getItem('adminToken');
                              try {
                                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/frame`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ frame: 'custom', customFrameUrl: admin.customFrameUrl })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  const updatedAdmin = { ...admin, avatarFrame: data.avatarFrame, customFrameUrl: data.customFrameUrl };
                                  setAdmin(updatedAdmin);
                                  localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                                }
                              } catch (e) { console.error(e); }
                            }}
                            style={{
                              background: admin?.avatarFrame === 'custom' ? 'linear-gradient(135deg, var(--btn-primary), #764ba2)' : 'var(--nav-link-hover)',
                              border: admin?.avatarFrame === 'custom' ? '2px solid var(--btn-primary)' : '2px solid #28a745',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              position: 'relative'
                            }}
                          >
                            {/* "My Frame" Badge */}
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#28a745',
                              color: 'white',
                              fontSize: '9px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>MY FRAME</div>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              margin: '0 auto 8px',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {/* Custom Frame */}
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: '-4px',
                                  borderRadius: '50%',
                                  backgroundImage: `url(${admin.customFrameUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  animation: 'frameSpinAnimation 3s linear infinite',
                                  padding: '3px'
                                }}
                              >
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  background: 'var(--card-bg)'
                                }}></div>
                              </div>
                              {/* Avatar */}
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--bg-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                zIndex: 1,
                                overflow: 'hidden'
                              }}>
                                {admin?.profilePicture ? (
                                  <img src={admin.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  admin?.username?.charAt(0).toUpperCase() || 'A'
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-color)', fontWeight: '500' }}>Custom</div>
                          </div>
                        )}

                        {/* Animated Frame Options */}
                        {[
                          { id: 'fire', name: 'Fire Ring', colors: ['#ff6b35', '#f7931e', '#ffcc02'], animation: 'spin' },
                          { id: 'neon', name: 'Neon Pulse', colors: ['#00d4ff', '#9d4edd', '#00d4ff'], animation: 'pulse' },
                          { id: 'galaxy', name: 'Galaxy Swirl', colors: ['#667eea', '#764ba2', '#f093fb'], animation: 'spin' },
                          { id: 'gold', name: 'Golden Crown', colors: ['#ffd700', '#ffec8b', '#daa520'], animation: 'shimmer' },
                          { id: 'electric', name: 'Electric', colors: ['#00d4ff', '#0099ff', '#fff'], animation: 'pulse' },
                          { id: 'rainbow', name: 'Rainbow', colors: ['#ff0080', '#ff8c00', '#40e0d0'], animation: 'rainbow' },
                          { id: 'ice', name: 'Ice Crystal', colors: ['#a8edea', '#fed6e3', '#fff'], animation: 'shimmer' },
                          { id: 'phantom', name: 'Phantom', colors: ['#6c5ce7', '#a29bfe', '#2d1b69'], animation: 'pulse' }
                        ].map(frame => (
                          <div
                            key={frame.id}
                            className={`frame-option ${admin?.avatarFrame === frame.id ? 'selected' : ''}`}
                            onClick={async () => {
                              const token = localStorage.getItem('adminToken');
                              try {
                                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/frame`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ frame: frame.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  const updatedAdmin = { ...admin, avatarFrame: data.avatarFrame, customFrameUrl: data.customFrameUrl };
                                  setAdmin(updatedAdmin);
                                  localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                                }
                              } catch (e) { console.error(e); }
                            }}
                            style={{
                              background: admin?.avatarFrame === frame.id ? 'linear-gradient(135deg, var(--btn-primary), #764ba2)' : 'var(--nav-link-hover)',
                              border: admin?.avatarFrame === frame.id ? '2px solid var(--btn-primary)' : '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              margin: '0 auto 8px',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {/* Animated Frame Ring */}
                              <div
                                className={`avatar-frame-ring frame-${frame.id}`}
                                style={{
                                  position: 'absolute',
                                  inset: '-4px',
                                  borderRadius: '50%',
                                  background: `conic-gradient(${frame.colors.join(', ')})`,
                                  animation: frame.animation === 'spin' ? 'frameSpinAnimation 3s linear infinite'
                                    : frame.animation === 'pulse' ? 'framePulseAnimation 2s ease-in-out infinite'
                                      : frame.animation === 'shimmer' ? 'frameShimmerAnimation 2s ease-in-out infinite'
                                        : 'frameRainbowAnimation 3s linear infinite',
                                  padding: '3px'
                                }}
                              >
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  background: 'var(--card-bg)'
                                }}></div>
                              </div>
                              {/* Avatar */}
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--bg-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                zIndex: 1,
                                overflow: 'hidden'
                              }}>
                                {admin?.profilePicture ? (
                                  <img src={admin.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  admin?.username?.charAt(0).toUpperCase() || 'A'
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-color)', fontWeight: '500' }}>{frame.name}</div>
                          </div>
                        ))}
                      </div>

                      {/* Custom Frame Upload Section - Separated */}
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: 'var(--nav-link-hover)',
                        borderRadius: '12px',
                        border: admin?.avatarFrame === 'custom' ? '2px solid var(--btn-primary)' : '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(100, 100, 100, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-color)' }}>
                              Upload Custom Frame
                            </h4>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                              Create your own unique avatar frame
                            </p>
                          </div>
                        </div>

                        {/* File Specifications */}
                        <div style={{
                          padding: '10px',
                          background: 'rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              </svg>
                              <span><strong>Formats:</strong> GIF, PNG, JPG, SVG, WebP</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9" />
                                <polyline points="9 21 3 21 3 15" />
                                <line x1="21" y1="3" x2="14" y2="10" />
                                <line x1="3" y1="21" x2="10" y2="14" />
                              </svg>
                              <span><strong>Size:</strong> 100x100px to 500x500px</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              </svg>
                              <span><strong>Aspect:</strong> 1:1 (Square)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="12" x2="2" y2="12" />
                                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                                <line x1="6" y1="16" x2="6.01" y2="16" />
                                <line x1="10" y1="16" x2="10.01" y2="16" />
                              </svg>
                              <span><strong>Max Size:</strong> 10MB</span>
                            </div>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                              <line x1="9" y1="18" x2="15" y2="18" />
                              <line x1="10" y1="22" x2="14" y2="22" />
                              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                            </svg>
                            <em>Tip: Use transparent PNG/GIF for best results. Frame will rotate around your avatar.</em>
                          </div>
                        </div>

                        {/* Current Custom Frame Preview */}
                        {admin?.customFrameUrl && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px',
                            background: 'rgba(40, 167, 69, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: '1px solid rgba(40, 167, 69, 0.3)'
                          }}>
                            <div style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              backgroundImage: `url(${admin.customFrameUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              animation: 'frameSpinAnimation 3s linear infinite',
                              flexShrink: 0
                            }}></div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', color: 'var(--text-color)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Custom Frame Active
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                Click below to replace or remove
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upload Progress Bar */}
                        {isUploadingFrame && (
                          <div style={{
                            marginBottom: '12px',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-color)', fontWeight: '500' }}>
                                Uploading...
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--btn-primary)', fontWeight: '600' }}>
                                {frameUploadProgress}%
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '6px',
                              background: 'rgba(0,0,0,0.2)',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${frameUploadProgress}%`,
                                height: '100%',
                                background: 'var(--btn-primary)',
                                borderRadius: '3px',
                                transition: 'width 0.2s ease'
                              }}></div>
                            </div>
                          </div>
                        )}

                        {/* Upload & Delete Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => document.getElementById('customFrameInput').click()}
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              background: 'var(--btn-primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {admin?.customFrameUrl ? 'Replace Frame' : 'Upload Frame'}
                          </button>

                          {admin?.customFrameUrl && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('adminToken');
                                try {
                                  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/custom-frame`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    const updatedAdmin = { ...admin, avatarFrame: null, customFrameUrl: null };
                                    setAdmin(updatedAdmin);
                                    localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                                  }
                                } catch (err) {
                                  console.error('Failed to delete custom frame:', err);
                                }
                              }}
                              style={{
                                padding: '10px 16px',
                                background: 'rgba(220, 53, 69, 0.1)',
                                color: '#dc3545',
                                border: '1px solid rgba(220, 53, 69, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Custom Frame Upload Input (hidden) */}
                      <input
                        type="file"
                        id="customFrameInput"
                        accept="image/gif,image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const token = localStorage.getItem('adminToken');
                          const formData = new FormData();
                          formData.append('frame', file);

                          setIsUploadingFrame(true);
                          setFrameUploadProgress(0);

                          const xhr = new XMLHttpRequest();
                          xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile/custom-frame`);
                          xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                          xhr.upload.onprogress = (event) => {
                            if (event.lengthComputable) {
                              const percent = Math.round((event.loaded / event.total) * 100);
                              setFrameUploadProgress(percent);
                            }
                          };

                          xhr.onload = () => {
                            setIsUploadingFrame(false);
                            setFrameUploadProgress(0);
                            if (xhr.status === 200) {
                              try {
                                const data = JSON.parse(xhr.responseText);
                                if (data.success) {
                                  const updatedAdmin = { ...admin, avatarFrame: 'custom', customFrameUrl: data.customFrameUrl };
                                  setAdmin(updatedAdmin);
                                  localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                                }
                              } catch (err) {
                                console.error('Failed to parse response:', err);
                              }
                            }
                          };

                          xhr.onerror = () => {
                            setIsUploadingFrame(false);
                            setFrameUploadProgress(0);
                            console.error('Failed to upload custom frame');
                          };

                          xhr.send(formData);
                          e.target.value = '';
                        }}
                      />

                      {/* Save Button */}
                      <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          background: 'var(--btn-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '16px'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Save Frame Selection
                      </button>

                      {/* Spacer for scroll visibility */}
                      <div style={{ height: '40px' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Image Crop Modal */}
      {
        showCropModal && cropImage && (
          <div className="crop-modal-overlay" onClick={cancelCrop}>
            <div className="crop-modal" onClick={e => e.stopPropagation()}>
              <div className="crop-modal-header">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary)" strokeWidth="2">
                    <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
                    <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
                  </svg>
                  Crop Profile Picture
                </h3>
                <button className="close-btn" onClick={cancelCrop}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="crop-preview-container">
                <p className="crop-hint">Drag to reposition • Use slider to zoom</p>
                <div
                  className="crop-preview"
                  onMouseDown={handleCropMouseDown}
                  onMouseMove={handleCropMouseMove}
                  onMouseUp={handleCropMouseUp}
                  onMouseLeave={handleCropMouseUp}
                  onTouchStart={handleCropMouseDown}
                  onTouchMove={handleCropMouseMove}
                  onTouchEnd={handleCropMouseUp}
                >
                  <img
                    ref={cropImageRef}
                    src={cropImage}
                    alt="Crop preview"
                    style={{
                      transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropZoom})`,
                      cursor: 'grab'
                    }}
                    draggable={false}
                  />
                  <div className="crop-circle-overlay"></div>
                </div>
              </div>

              <div className="crop-controls">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                />
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </label>
              </div>

              <div className="crop-actions">
                <button className="crop-cancel-btn" onClick={cancelCrop}>Cancel</button>
                <button className="crop-confirm-btn" onClick={handleCropConfirm} disabled={uploadingPicture}>
                  {uploadingPicture ? (
                    <>
                      <div className="btn-spinner"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Apply & Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminLayout;