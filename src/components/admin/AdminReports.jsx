import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/StatusBadge';
import { STATUS_META, formatCNY } from '@/lib/booking';
import { formatNZD } from '@/lib/shop';

const PIE_COLORS = ['#0d2536', '#2f6f8f', '#c9922f', '#3f8f6a', '#6b5a8f'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [statusRows, setStatusRows] = useState([]);
  const [sourceRows, setSourceRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);
  const [discountRows, setDiscountRows] = useState([]);
  const [refundRows, setRefundRows] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [retailStatusRows, setRetailStatusRows] = useState([]);
  const [retailShipRows, setRetailShipRows] = useState([]);
  const [retailCancelled, setRetailCancelled] = useState(0);
  const [agentSalesRows, setAgentSalesRows] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [
        statusAgg,
        sourceAgg,
        paymentAgg,
        discountAgg,
        refundAgg,
        metricPage,
        refundPage,
        pending,
        retailStatusAgg,
        retailShipAgg,
        retailCancelledCount,
        agentSalesAgg,
      ] = await Promise.all([
          base44.entities.Booking.aggregate({ groupBy: 'status' }),
          base44.entities.Booking.aggregate({ groupBy: 'source', sum: ['total_amount'] }),
          base44.entities.Booking.aggregate({
            query: { payment_status: 'paid' },
            groupBy: 'payment_method',
            sum: ['total_amount'],
          }),
          base44.entities.Booking.aggregate({
            query: { discount_amount: { $gt: 0 } },
            groupBy: 'discount_code',
            sum: ['discount_amount'],
          }),
          base44.entities.Booking.aggregate({
            query: { status: 'refunded' },
            groupBy: 'product_category',
            sum: ['total_amount'],
          }),
          base44.entities.DailyMetric.list({ sort: 'date', limit: 200 }),
          base44.entities.Booking.filter({ status: 'refund_requested' }, { limit: 20 }),
          base44.entities.Booking.count({ status: 'refund_requested' }),
          base44.entities.RetailOrder.aggregate({ groupBy: 'status', sum: ['total_amount'] }),
          base44.entities.RetailOrder.aggregate({
            query: { payment_status: 'paid' },
            groupBy: 'shipping_method',
            sum: ['total_amount'],
          }),
          base44.entities.RetailOrder.count({ status: 'cancelled' }),
          base44.entities.Booking.aggregate({
            query: { agent_email: { $exists: true } },
            groupBy: 'agent_name',
            sum: ['total_amount'],
          }),
        ]);

      if (!active) return;
      setStatusRows(statusAgg.rows || []);
      setSourceRows(sourceAgg.rows || []);
      setPaymentRows(paymentAgg.rows || []);
      setDiscountRows(discountAgg.rows || []);
      setRefundRows(refundAgg.rows || []);
      setMetrics(metricPage.items || []);
      setRefundRequests(refundPage.items || []);
      setPendingCount(pending || 0);
      setRetailStatusRows(retailStatusAgg.rows || []);
      setRetailShipRows(retailShipAgg.rows || []);
      setRetailCancelled(retailCancelledCount || 0);
      setAgentSalesRows(agentSalesAgg.rows || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const sumOf = (rows, field) => rows.reduce((total, row) => total + Number(row[field] || 0), 0);
  const revenue = sumOf(paymentRows, 'sum_total_amount');
  const discountTotal = sumOf(discountRows, 'sum_discount_amount');
  const refundTotal = sumOf(refundRows, 'sum_total_amount');
  const orderCount = statusRows.reduce((total, row) => total + Number(row.count || 0), 0);
  const refundedCount = statusRows.find((row) => row.status === 'refunded')?.count || 0;

  const retailOrders = retailStatusRows.reduce((total, row) => total + Number(row.count || 0), 0);
  const retailRevenue = sumOf(retailShipRows, 'sum_total_amount');
  const agentRows = agentSalesRows.filter((row) => Number(row.count || 0) > 0);

  const visits = metrics.reduce((total, item) => total + Number(item.visits || 0), 0);
  const conversions = metrics.reduce((total, item) => total + Number(item.conversions || 0), 0);
  const conversionRate = visits ? ((conversions / visits) * 100).toFixed(2) : '0.00';

  const byDate = {};
  metrics.forEach((item) => {
    if (!byDate[item.date]) byDate[item.date] = { date: item.date.slice(5), visits: 0, checkout: 0, conversions: 0 };
    byDate[item.date].visits += Number(item.visits || 0);
    byDate[item.date].checkout += Number(item.checkout_starts || 0);
    byDate[item.date].conversions += Number(item.conversions || 0);
  });
  const trendData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  const sourcePie = {};
  metrics.forEach((item) => {
    sourcePie[item.source] = (sourcePie[item.source] || 0) + Number(item.visits || 0);
  });
  const sourcePieData = Object.entries(sourcePie).map(([name, value]) => ({ name, value }));

  const statusBarData = statusRows.map((row) => ({
    name: STATUS_META[row.status]?.label || row.status,
    订单数: row.count || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '累计订单', value: orderCount },
          { label: '已支付营收', value: formatCNY(revenue) },
          { label: '折扣让利', value: formatCNY(discountTotal) },
          { label: '退款金额', value: formatCNY(refundTotal) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-heading text-[20px]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '近 14 天访问量', value: visits },
          { label: '下单转化数', value: conversions },
          { label: '访问转化率', value: `${conversionRate}%` },
          { label: '待处理退款', value: pendingCount },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-card p-4">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-heading text-[18px]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-heading text-[15px]">流量与转化趋势</h3>
          <p className="text-[11px] text-muted-foreground">近 14 天小程序访问、进入结算与成交（模拟埋点数据）</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaef" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="visits" name="访问量" fill="#0d2536" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkout" name="进入结算" fill="#2f6f8f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="成交" fill="#c9922f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">流量来源</h3>
          <p className="text-[11px] text-muted-foreground">访问量占比</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourcePieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {sourcePieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">订单状态分布</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaef" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                <Bar dataKey="订单数" fill="#0d2536" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">支付方式与营收</h3>
          <div className="mt-4 space-y-3">
            {paymentRows.map((row) => (
              <div key={row.payment_method} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">
                  {row.payment_method === 'wechat_pay'
                    ? '微信支付'
                    : row.payment_method === 'card'
                      ? '银行卡支付'
                      : '代理转账'}
                </span>
                <span>
                  {row.count || 0} 笔 · <span className="font-heading text-[14px]">{formatCNY(row.sum_total_amount)}</span>
                </span>
              </div>
            ))}
            {paymentRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无已支付订单</p>
            )}
          </div>

          <h3 className="mt-6 font-heading text-[15px]">渠道营收（按来源）</h3>
          <div className="mt-4 space-y-2.5">
            {sourceRows.map((row) => (
              <div key={row.source} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{row.source || '未标记'}</span>
                  <span>
                    {row.count || 0} 笔 · {formatCNY(row.sum_total_amount)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#2f6f8f]"
                    style={{
                      width: `${Math.min(
                        100,
                        ((Number(row.sum_total_amount || 0) || 1) / Math.max(revenue, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {sourceRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无渠道数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">折扣码使用与让利</h3>
          <div className="mt-3 space-y-2">
            {discountRows.map((row) => (
              <div key={row.discount_code} className="flex items-center justify-between text-[12px]">
                <span className="font-mono">{row.discount_code || '未填写'}</span>
                <span className="text-muted-foreground">
                  {row.count || 0} 笔 · 让利 {formatCNY(row.sum_discount_amount)}
                </span>
              </div>
            ))}
            {discountRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无折扣码成交</p>
            )}
          </div>

          <h3 className="mt-6 font-heading text-[15px]">退款金额（按产品分类）</h3>
          <div className="mt-3 space-y-2">
            {refundRows.map((row) => (
              <div key={row.product_category} className="flex items-center justify-between text-[12px]">
                <span>{row.product_category || '未分类'}</span>
                <span className="text-muted-foreground">
                  {row.count || 0} 笔 · {formatCNY(row.sum_total_amount)}
                </span>
              </div>
            ))}
            {refundRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">
                暂无已退款订单（已退款 {refundedCount} 笔）
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">山地商店零售报表</h3>
          <p className="text-[11px] text-muted-foreground">
            Shopify 零售渠道，与雪票营收分开结算（NZD）
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: '零售订单', value: retailOrders },
              { label: '已支付营收', value: formatNZD(retailRevenue) },
              { label: '已取消', value: retailCancelled },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 px-2 py-2.5">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-heading text-[14px]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {retailStatusRows.map((row) => (
              <div key={row.status} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">
                  {STATUS_META[row.status]?.label || row.status}
                </span>
                <span>
                  {row.count || 0} 笔 · {formatNZD(row.sum_total_amount)}
                </span>
              </div>
            ))}
            {retailStatusRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无零售订单</p>
            )}
          </div>
          <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-3">
            <p className="text-[11px] text-muted-foreground">配送方式营收</p>
            {retailShipRows.map((row) => (
              <div key={row.shipping_method} className="flex items-center justify-between text-[12px]">
                <span>{row.shipping_method || '门店自提'}</span>
                <span className="text-muted-foreground">
                  {row.count || 0} 笔 · {formatNZD(row.sum_total_amount)}
                </span>
              </div>
            ))}
            {retailShipRows.length === 0 && (
              <p className="py-4 text-center text-[12px] text-muted-foreground">暂无已支付零售订单</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">代理销售报表</h3>
          <p className="text-[11px] text-muted-foreground">按代理归集的雪票成交与折扣让利</p>
          <div className="mt-4 space-y-2">
            {agentRows.map((row) => (
              <div key={row.agent_name || 'unknown'} className="flex items-center justify-between text-[12px]">
                <span>{row.agent_name || '其他代理订单'}</span>
                <span className="text-muted-foreground">
                  {row.count || 0} 笔 · {formatCNY(row.sum_total_amount)}
                </span>
              </div>
            ))}
            {agentRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无代理成交订单</p>
            )}
          </div>
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[10.5px] leading-relaxed text-muted-foreground">
            结算口径：零售营收按 Shopify 订单结算，代理佣金按雪票实付金额与协议折扣区间（5% / 10% / 15%）核算。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-heading text-[15px]">待处理退款申请</h3>
          <div className="mt-3 space-y-2">
            {refundRequests.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[12px]"
              >
                <div>
                  <p>{booking.product_name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{booking.order_no}</p>
                </div>
                <StatusBadge status={booking.status} />
                <span className="font-heading text-[14px]">{formatCNY(booking.total_amount)}</span>
              </div>
            ))}
            {refundRequests.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">暂无待处理退款申请</p>
            )}
          </div>

          <p className="mt-6 rounded-xl border border-dashed border-sky-200 bg-sky-50/70 p-3 text-[11px] leading-relaxed text-sky-900">
            报表数据来源：小程序埋点（模拟）与订单库实时聚合。接入 Aspenware 后，营收与核销数据将以其 POS 数据为准。
          </p>
        </div>
      </div>
    </div>
  );
}