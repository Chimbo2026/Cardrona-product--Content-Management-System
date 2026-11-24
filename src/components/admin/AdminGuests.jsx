import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { maskDocument } from '@/lib/booking';

export default function AdminGuests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyWaiver, setOnlyWaiver] = useState('signed');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let active = true;
    base44.entities.Booking.list({ sort: '-created_date', limit: 100 })
      .then((page) => {
        if (active) setBookings(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = bookings
    .filter((booking) => {
      if (onlyWaiver === 'signed' && !booking.waiver_signed) return false;
      if (onlyWaiver === 'unsigned' && booking.waiver_signed) return false;
      return true;
    })
    .filter((booking) => {
      if (!keyword) return true;
      const text = `${booking.guest_name_pinyin || ''} ${booking.guest_legal_name || ''} ${booking.order_no}`;
      return text.toLowerCase().includes(keyword.toLowerCase());
    });

  const signedCount = bookings.filter((booking) => booking.waiver_signed).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] text-muted-foreground">游客记录</p>
          <p className="mt-1.5 font-heading text-[20px]">{bookings.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] text-muted-foreground">免责声明已签署</p>
          <p className="mt-1.5 font-heading text-[20px]">{signedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] text-muted-foreground">待补签</p>
          <p className="mt-1.5 font-heading text-[20px]">{bookings.length - signedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索拼音姓名 / 法定姓名 / 订单号"
            className="h-9 w-72 pl-8 text-[12px]"
          />
        </div>
        {[
          { key: 'signed', label: '已签署' },
          { key: 'unsigned', label: '待补签' },
          { key: 'all', label: '全部' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setOnlyWaiver(item.key)}
            className={`rounded-full px-3 py-1.5 text-[11px] transition ${
              onlyWaiver === item.key ? 'bg-[#0d2536] text-white' : 'bg-white text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{booking.order_no}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                    booking.waiver_signed
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {booking.waiver_signed ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {booking.waiver_signed ? '免责声明已签署' : '待补签'}
                </span>
                <span className="text-[11px] text-muted-foreground">{booking.product_name}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">{booking.visit_date}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">护照姓名（拼音）</p>
                  <p className="mt-0.5 text-[12px]">{booking.guest_name_pinyin || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">法定姓名</p>
                  <p className="mt-0.5 text-[12px]">{booking.guest_legal_name || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">出生日期</p>
                  <p className="mt-0.5 text-[12px]">{booking.guest_dob || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">国籍 / 地区</p>
                  <p className="mt-0.5 text-[12px]">{booking.guest_nationality || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">护照号码</p>
                  <p className="mt-0.5 font-mono text-[12px]">{maskDocument(booking.guest_document_no)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">联系方式</p>
                  <p className="mt-0.5 text-[12px]">
                    {booking.guest_phone || '—'}
                    {booking.guest_email ? ` · ${booking.guest_email}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">同行游客</p>
                  <p className="mt-0.5 text-[12px]">
                    {booking.extra_guests?.length
                      ? booking.extra_guests.map((guest) => guest.name_pinyin || '未填写').join('、')
                      : '无'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">签署信息</p>
                  <p className="mt-0.5 text-[12px]">
                    {booking.waiver_signed
                      ? `${booking.waiver_signature || '—'} · ${
                          booking.waiver_signed_at
                            ? new Date(booking.waiver_signed_at).toLocaleString('zh-CN')
                            : ''
                        }`
                      : '未签署'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-[12px] text-muted-foreground">
              没有符合条件的游客记录
            </p>
          )}
        </div>
      )}
    </div>
  );
}