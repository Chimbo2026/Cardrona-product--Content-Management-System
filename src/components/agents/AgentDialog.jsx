import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import RecordFormDialog from '@/components/common/RecordFormDialog';

const LEVELS = [
  { value: '5', label: '5% — Standard' },
  { value: '10', label: '10% — Preferred' },
  { value: '15', label: '15% — Strategic' },
];

export default function AgentDialog({ open, onOpenChange, agent, existingCodes = [], onSaved }) {
  const { toast } = useToast();

  const fields = useMemo(() => [
    { name: 'company_name', label: 'Company', type: 'text', required: true, colSpan: 2 },
    { name: 'agent_code', label: 'Agent code', type: 'text', required: true },
    { name: 'market', label: 'Source market', type: 'text', required: true, placeholder: 'China · Shanghai' },
    { name: 'contact_name', label: 'Contact', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'discount_rate', label: 'Net-rate discount', type: 'select', required: true, options: LEVELS, defaultValue: '10' },
    { name: 'currency', label: 'Contract currency', type: 'select', options: ['NZD', 'AUD', 'CNY', 'TWD', 'HKD'], defaultValue: 'NZD' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Onboarding', 'Paused'], defaultValue: 'Active' },
    { name: 'contract_start', label: 'Contract start', type: 'date' },
    { name: 'photo_url', label: 'Agent imagery', type: 'image', colSpan: 2, hint: 'Brand or destination photo shown on the agent card' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ], []);

  const initialValues = agent
    ? {
        company_name: agent.company_name || '',
        agent_code: agent.agent_code || '',
        market: agent.market || '',
        contact_name: agent.contact_name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        discount_rate: String(agent.discount_rate ?? '10'),
        currency: agent.currency || 'NZD',
        status: agent.status || 'Active',
        contract_start: agent.contract_start || '',
        photo_url: agent.photo_url || '',
        notes: agent.notes || '',
      }
    : { status: 'Active', discount_rate: '10', currency: 'NZD' };

  const submit = async (values) => {
    const payload = { ...values, discount_rate: Number(values.discount_rate) || 0 };
    if (existingCodes.includes(payload.agent_code) && payload.agent_code !== agent?.agent_code) {
      throw new Error('That agent code is already in use.');
    }
    if (agent) {
      await base44.entities.Agent.update(agent.id, payload);
      toast({ title: 'Agent updated', description: `${payload.company_name} saved.` });
    } else {
      await base44.entities.Agent.create(payload);
      toast({ title: 'Agent added', description: `${payload.company_name} · -${payload.discount_rate}%` });
    }
    onSaved?.();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={agent ? `Edit ${agent.company_name}` : 'New trade agent'}
      description="Trade partners receive net-rate discounts on resort products. All records are demonstration data."
      fields={fields}
      initialValues={initialValues}
      onSubmit={submit}
      submitLabel={agent ? 'Save changes' : 'Add agent'}
    />
  );
}