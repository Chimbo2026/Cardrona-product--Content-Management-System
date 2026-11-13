export const ROLES = {
  administrator: {
    label: ['系统管理员', 'Administrator'],
    detail: ['完整演示配置与管理权限', 'Full demo configuration and management access'],
  },
  operations: {
    label: ['运营经理', 'Operations Manager'],
    detail: ['山地运营、事件与维修', 'Mountain operations, incidents and maintenance'],
  },
  guest_services: {
    label: ['宾客服务', 'Guest Services'],
    detail: ['宾客档案、预订与缆车票', 'Guest records, bookings and lift passes'],
  },
  instructor: {
    label: ['教练 / 主管', 'Instructor / Supervisor'],
    detail: ['课程安排、排班与考勤', 'Lesson schedules, rosters and attendance'],
  },
  rental: {
    label: ['租赁人员', 'Rental Staff'],
    detail: ['库存、租赁订单与装备归还', 'Inventory, rental orders and equipment returns'],
  },
  viewer: {
    label: ['管理查看', 'Management Viewer'],
    detail: ['只读查看驾驶舱与报表', 'Read-only dashboards and reports'],
  },
};

export const ROLE_KEYS = Object.keys(ROLES);
const ALL = ROLE_KEYS;

// Access matrix: 'view' = may open the module, 'write' = may create/edit/delete records.
const ACCESS = {
  dashboard: { view: ALL, write: [] },
  bookings: {
    view: ['administrator', 'guest_services', 'operations', 'viewer', 'rental'],
    write: ['administrator', 'guest_services'],
  },
  booking_management: { view: ALL, write: ALL },
  guests: {
    view: ['administrator', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'guest_services'],
  },
  refunds: {
    view: ['administrator', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'guest_services'],
  },
  agents: {
    view: ['administrator', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'guest_services'],
  },
  passes: {
    view: ['administrator', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'guest_services'],
  },
  lessons: {
    view: ['administrator', 'instructor', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'instructor', 'guest_services'],
  },
  retail: {
    view: ['administrator', 'rental', 'guest_services', 'operations', 'viewer'],
    write: ['administrator', 'rental', 'guest_services'],
  },
  operations: { view: ALL, write: ['administrator', 'operations'] },
  dining: {
    view: ALL,
    write: ['administrator', 'operations', 'guest_services'],
  },
  maintenance: {
    view: ['administrator', 'operations', 'viewer', 'rental'],
    write: ['administrator', 'operations'],
  },
  staff: {
    view: ['administrator', 'operations', 'viewer'],
    write: ['administrator', 'operations'],
  },
  transport: {
    view: ['administrator', 'operations', 'guest_services', 'viewer'],
    write: ['administrator', 'operations', 'guest_services'],
  },
  accommodation: {
    view: ['administrator', 'guest_services', 'viewer', 'operations'],
    write: ['administrator', 'guest_services'],
  },
  events: {
    view: ALL,
    write: ['administrator', 'operations', 'guest_services'],
  },
  reports: {
    view: ['administrator', 'viewer', 'operations'],
    write: [],
  },
  analytics: {
    view: ['administrator', 'viewer', 'operations'],
    write: ['administrator'],
  },
  content: {
    view: ['administrator', 'operations'],
    write: ['administrator'],
  },
};

export const can = (role, moduleKey, action = 'view') => {
  const entry = ACCESS[moduleKey];
  if (!entry) return true;
  return (entry[action] || []).includes(role);
};

export const canViewSensitiveStaff = (role) => ['administrator', 'operations'].includes(role);