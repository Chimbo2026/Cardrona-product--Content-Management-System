import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Snowflake, ArrowLeft, ShieldAlert, Eye } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { startCustomerView } from '@/lib/customerView';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminAgents from '@/components/admin/AdminAgents';
import AdminGuests from '@/components/admin/AdminGuests';
import AdminReports from '@/components/admin/AdminReports';

const TABS = [
  { key: 'orders', label: '订单管理' },
  { key: 'products', label: '产品管理' },
  { key: 'agents', label: '代理与折扣' },
  { key: 'guests', label: '游客与免责' },
  { key: 'reports', label: '数据报表' },
];

export default function Admin() {
  const { user, loading } = useCurrentUser();
  const [tab, setTab] = useState('orders');
  const navigate = useNavigate();

  const openCustomerView = () => {
    startCustomerView();
    navigate('/');
  };

  useEffect(() => {
    document.title = '运营管理后台 · 雪山度假村';
    return () => {
      document.title = '雪山度假村 · 中文雪票预订';
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08151f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#08151f] px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-heading text-[18px] text-white">需要管理员权限</h1>
          <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-white/60">
            运营后台仅对管理员开放。如需查看，请联系运营负责人为你的账号分配管理员角色。
          </p>
        </div>
        <Link
          to="/"
          className="rounded-full bg-white px-5 py-2 text-[12px] font-medium text-[#0d2536] transition hover:bg-white/90"
        >
          返回小程序
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-16">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2536] text-white">
            <Snowflake className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-[15px]">运营管理后台</p>
            <p className="text-[11px] text-muted-foreground">雪山度假村 · 中文预订渠道</p>
          </div>
          <button
            type="button"
            onClick={openCustomerView}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-[12px] text-muted-foreground transition hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" /> 以顾客视角查看
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2 scrollbar-none">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] transition ${
                tab === item.key
                  ? 'bg-[#0d2536] text-white'
                  : 'text-muted-foreground hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {tab === 'orders' && <AdminOrders />}
        {tab === 'products' && <AdminProducts />}
        {tab === 'agents' && <AdminAgents />}
        {tab === 'guests' && <AdminGuests />}
        {tab === 'reports' && <AdminReports />}
      </main>
    </div>
  );
}