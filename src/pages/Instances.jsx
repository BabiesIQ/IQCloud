import { Navigate } from 'react-router-dom';

export const route = { path: '/instances', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'Server', label: 'Instances', section: 'Infrastructure', order: 20, profiles: null };

// The real customer instance list lives in /dashboard. This route previously
// displayed ApperSDK demo records; send users to their real paid VPS dashboard.
export default function Instances() {
  return <Navigate to="/dashboard" replace />;
}
