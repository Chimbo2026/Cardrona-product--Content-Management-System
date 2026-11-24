import { createContext, useContext, useEffect, useState } from 'react';
import { can, canViewSensitiveStaff, ROLES } from '@/lib/roles';
import { useLang } from '@/lib/i18n';

const RoleContext = createContext(null);
const STORAGE_KEY = 'cardrona_demo_role';

export function RoleProvider({ children }) {
  const { lang } = useLang();
  const [role, setRoleState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'administrator');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const value = {
    role,
    roleLabel: ROLES[role]
      ? (lang === 'zh' ? ROLES[role].label[0] : ROLES[role].label[1])
      : (lang === 'zh' ? '系统管理员' : 'Administrator'),
    roleDetail: ROLES[role]
      ? (lang === 'zh' ? ROLES[role].detail[0] : ROLES[role].detail[1])
      : '',
    setRole: (next) => setRoleState(ROLES[next] ? next : 'administrator'),
    can: (moduleKey, action = 'view') => can(role, moduleKey, action),
    canViewSensitiveStaff: canViewSensitiveStaff(role),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);