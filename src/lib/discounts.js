import { base44 } from '@/api/base44Client';
import { toDateKey } from '@/lib/booking';

// 校验折扣码，返回 { record } 或 { error, scope }
export const lookupDiscount = async (rawCode, category) => {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { error: 'missing' };

  const results = await base44.entities.DiscountCode.filter({ code });
  const record = results?.[0];
  if (!record) return { error: 'missing' };
  if (record.status !== 'active') return { error: 'inactive' };

  const today = toDateKey(new Date());
  if (record.valid_from && today < record.valid_from) return { error: 'not_started', record };
  if (record.valid_to && today > record.valid_to) return { error: 'expired' };
  if (record.usage_limit > 0 && Number(record.used_count || 0) >= Number(record.usage_limit)) {
    return { error: 'limit' };
  }
  if (record.scope && record.scope !== '全部' && category && record.scope !== category) {
    return { error: 'scope', scope: record.scope };
  }
  return { record };
};