// Helper function to check if admin has view-only access (based on role)
export const isViewOnly = (admin) => {
    return admin?.role === 'normal_viewer' || admin?.role === 'special_viewer';
};

// Helper function to check if admin can view a specific section
export const canView = (admin, section) => {
    if (!admin) return false;

    // Super admin can view everything
    if (admin.role === 'super_admin' || admin.role === 'superadmin') return true;

    const permissions = admin.permissions || [];

    // Creator permission means full access
    if (permissions.includes('creator')) return true;

    // Check view_everything permission
    if (permissions.includes('view_everything')) return true;

    // Check specific view permission
    const viewPermission = `view_${section}`;
    if (permissions.includes(viewPermission)) return true;

    // If admin has manage permission, they can also view
    const managePermission = `manage_${section}`;
    if (permissions.includes(managePermission)) return true;

    return false;
};

// Helper function to check if admin can edit a specific section
export const canEdit = (admin, section) => {
    if (!admin) return false;

    // Super admin can edit everything
    if (admin.role === 'super_admin' || admin.role === 'superadmin') return true;

    const permissions = admin.permissions || [];

    // Creator permission means full access
    if (permissions.includes('creator')) return true;

    // Viewers (normal_viewer/special_viewer roles) cannot edit even with permissions
    // This is a safety check based on role
    if (isViewOnly(admin)) return false;

    // Check manage permission for the section
    const managePermission = `manage_${section}`;
    return permissions.includes(managePermission);
};

// Helper function to check if an admin has view-only access to a section
// (has view permission but NOT manage permission)
export const hasViewOnlyAccess = (admin, section) => {
    if (!admin) return false;

    // Super admin and creators have full access
    if (admin.role === 'super_admin' || admin.role === 'superadmin') return false;

    const permissions = admin.permissions || [];
    if (permissions.includes('creator')) return false;

    const viewPermission = `view_${section}`;
    const managePermission = `manage_${section}`;

    // Has view but not manage = view only
    const hasView = permissions.includes('view_everything') || permissions.includes(viewPermission);
    const hasManage = permissions.includes(managePermission);

    return hasView && !hasManage;
};

export default { isViewOnly, canView, canEdit, hasViewOnlyAccess };

