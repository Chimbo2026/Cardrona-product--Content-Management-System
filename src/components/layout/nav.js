import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Handshake,
  Ticket,
  GraduationCap,
  Mountain,
  UserCog,
  Bus,
  BedDouble,
  PartyPopper,
  BarChart3,
  TrendingUp,
  FileText,
  CreditCard,
  RotateCcw,
  Gift,
  Store,
  Warehouse,
  ShieldCheck,
  LayoutTemplate,
  UtensilsCrossed,
  Snowflake,
} from 'lucide-react';

// labels are [zh, en] pairs; use navLabel(label, lang) to pick one
export const NAV_SECTIONS = [
  {
    label: ['总览', 'Overview'],
    items: [{ key: 'dashboard', label: ['管理驾驶舱', 'Executive Dashboard'], path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: ['前厅', 'Front Desk'],
    items: [
      { key: 'booking_management', label: ['预订管理', 'Booking Management'], path: '/booking-management', icon: CalendarClock },
      { key: 'accommodation', label: ['住宿管理', 'Accommodation'], path: '/accommodation', icon: BedDouble },
    ],
  },
  {
    label: ['宾客与代理', 'Guests & Agents'],
    items: [
      { key: 'guests', label: ['宾客档案', 'Guests'], path: '/guests', icon: Users },
      { key: 'agents', label: ['渠道代理', 'Agents'], path: '/agents', icon: Handshake },
    ],
  },
  {
    label: ['财务', 'Finance'],
    items: [
      { key: 'payments', label: ['收付款', 'Payments'], path: '/payments', icon: CreditCard },
      { key: 'refunds', label: ['退款管理', 'Refund Manager'], path: '/refunds', icon: RotateCcw },
      { key: 'gift_vouchers', label: ['礼品卡', 'Gift Vouchers'], path: '/gift-vouchers', icon: Gift },
    ],
  },
  {
    label: ['零售与缆车票', 'Retail & Passes'],
    items: [
      { key: 'retail', label: ['零售商店', 'Retail Store'], path: '/management/retail', icon: Store },
      { key: 'retail_inventory', label: ['零售库存', 'Retail Inventory'], path: '/retail-inventory', icon: Warehouse },
      { key: 'passes', label: ['缆车票', 'Lift Passes'], path: '/management/passes', icon: Ticket },
    ],
  },
  {
    label: ['山地运营', 'On-Mountain'],
    items: [
      { key: 'ski', label: ['滑雪', 'Ski'], path: '/management/ski', icon: Snowflake },
      { key: 'lessons', label: ['滑雪学校', 'Snow School'], path: '/management/lessons', icon: GraduationCap },
    ],
  },
  {
    label: ['配套服务', 'Services'],
    items: [
      { key: 'transport', label: ['交通接驳', 'Transport'], path: '/management/transport', icon: Bus },
      { key: 'events', label: ['活动日历', 'Events & Activities'], path: '/events', icon: PartyPopper },
      { key: 'dining', label: ['餐厅与咖啡厅', 'Restaurants & Cafés'], path: '/dining', icon: UtensilsCrossed },
    ],
  },
  {
    label: ['人员', 'People'],
    items: [
      { key: 'staff', label: ['员工排班', 'Staff Roster'], path: '/staff', icon: UserCog },
      { key: 'ownership_support', label: ['业主关系', 'Owner Relations'], path: '/ownership-support', icon: ShieldCheck },
    ],
  },
  {
    label: ['数据洞察', 'Insight'],
    items: [
      { key: 'reports', label: ['财务报告', 'Financial Reporting'], path: '/reports', icon: BarChart3 },
      { key: 'analytics', label: ['营销分析', 'Analytics'], path: '/analytics', icon: TrendingUp },
    ],
  },
  {
    label: ['行政管理', 'Administration'],
    items: [
      { key: 'content', label: ['内容管理', 'Content Management'], path: '/content', icon: FileText },
      { key: 'website_builder', label: ['网站构建器', 'Website Builder'], path: '/website-builder', icon: LayoutTemplate },
      { key: 'operations', label: ['运行控制', 'Operations Control'], path: '/operations', icon: Mountain },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export const navLabel = (label, lang) => (Array.isArray(label) ? (lang === 'zh' ? label[0] : label[1]) : label);
