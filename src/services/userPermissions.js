import { createPermissions } from '@/services/permissions';

export const PROFILES = {
  Admin_c: { label: 'Platform admin', isDefault: false, isPublic: false, canManageTeam: true, reportsTo: null },
  Customer_c: { label: 'Customer', isDefault: true, isPublic: false, canManageTeam: false, reportsTo: 'Admin_c' },
};

const TABLE_PERMISSIONS = {
  Admin_c: {
    instances_c: { access: 'Full' },
    domains_c: { access: 'Full' },
    invoices_c: { access: 'Full' },
    tickets_c: { access: 'Full' },
  },
  Customer_c: {
    instances_c: { access: 'Full' },
    domains_c: { access: 'Full' },
    invoices_c: { access: 'Read' },
    tickets_c: { access: 'Full' },
  },
};

export const { getProfileMeta, getTableAccess, getFieldAccess } = createPermissions(PROFILES, TABLE_PERMISSIONS);
