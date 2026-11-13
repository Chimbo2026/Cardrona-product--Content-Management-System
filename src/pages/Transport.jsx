import { useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { DemoChip, SelectNative } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { num } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Image } from '@/components/ui/image';

export default function Transport() {
  const { can } = useRole();
  const canWrite = can('transport', 'write');
  const { toast } = useToast();
  const { items: routes, loading, reload } = useList('TransportRoute', {}, { sort: 'depart_time', limit: 100 });
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const seats = routes.reduce((s, r) => s + (Number(r.booked) || 0), 0);
  const capacity = routes.reduce((s, r) => s + (Number(r.capacity) || 0), 0);
  const filtered = routes.filter((r) => status === 'All' || r.status === status);

  const fields = [
    { name: 'name', label: 'Service name', required: true, colSpan: 2 },
    { name: 'price', label: 'Price from (NZD)', type: 'number', step: '0.01' },
    { name: 'image_url', label: 'Service photo', type: 'image', caption: 'Shown on the shuttle service list.' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'origin', label: 'Origin', required: true },
    { name: 'destination', label: 'Destination', required: true },
    { name: 'depart_time', label: 'Departure time', type: 'time', required: true },
    { name: 'return_time', label: 'Return time', type: 'time' },
    { name: 'capacity', label: 'Seat capacity', type: 'number', required: true },
    { name: 'booked', label: 'Passengers booked', type: 'number' },
    { name: 'vehicle', label: 'Vehicle' },
    { name: 'driver', label: 'Driver' },
    { name: 'operating_days', label: 'Operating days' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['On Time', 'Delayed', 'Cancelled', 'Completed'] },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];

  const submit = async (values) => {
    if (Number(values.booked) > Number(values.capacity)) throw new Error('Passengers booked cannot exceed seat capacity.');
    if (editing) {
      await base44.entities.TransportRoute.update(editing.id, values);
      toast({ title: 'Service updated', description: values.name });
    } else {
      await base44.entities.TransportRoute.create(values);
      toast({ title: 'Service added', description: values.name });
    }
    reload();
  };

  const columns = [
    {
      key: 'name',
      label: 'Service',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted">
            {r.image_url ? <Image src={r.image_url} alt={r.name} fittingType="fill" className="h-full w-full" /> : null}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-forest-900">{r.name}</p>
            <p className="text-[11px] text-muted-foreground">{r.vehicle} · {r.driver || 'Driver TBC'}</p>
            {r.description && <p className="line-clamp-2 text-[11px] text-muted-foreground">{r.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (r) => (
        <span className="text-[11.5px] text-muted-foreground">
          {r.origin} → {r.destination}
        </span>
      ),
    },
    {
      key: 'times',
      label: 'Depart / return',
      render: (r) => (
        <div>
          <p className="num text-[12px]">{r.depart_time}{r.return_time ? ` / ${r.return_time}` : ''}</p>
          <p className="num text-[11px] text-muted-foreground">{r.price != null && r.price !== '' ? `from $${Number(r.price).toFixed(0)}` : '—'}</p>
        </div>
      ),
    },
    {
      key: 'load',
      label: 'Passengers',
      render: (r) => {
        const pct = r.capacity ? (r.booked / r.capacity) * 100 : 0;
        return (
          <div className="w-36">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="num font-medium text-forest-900">{r.booked} / {r.capacity}</span>
              <span className="text-muted-foreground">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-forest-50">
              <div className={cn('h-full rounded-full', pct >= 95 ? 'bg-amber-500' : 'bg-ice-500')} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      },
    },
    { key: 'operating_days', label: 'Days', render: (r) => <span className="text-[11.5px] text-muted-foreground">{r.operating_days || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) =>
        canWrite ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[11.5px]" onClick={() => { setEditing(r); setOpen(true); }}>
            Edit
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Guest services"
        title="Transport coordination"
        description="Demonstration shuttle schedules, capacities and passenger counts. Not an official timetable."
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Add service
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-ice-200 bg-ice-50/70 px-3.5 py-2.5">
        <DemoChip>Demonstration timetable</DemoChip>
        <p className="text-[11.5px] text-ice-900">Schedules, vehicles and passenger numbers are fictional and not connected to any transport operator.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Services listed', num(routes.length)],
          ['Passengers booked', num(seats)],
          ['Seat utilisation', `${capacity ? Math.round((seats / capacity) * 100) : 0}%`],
          ['Delays today', num(routes.filter((r) => r.status === 'Delayed').length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Shuttle services"
        bodyClassName="p-0"
        action={
          <SelectNative ariaLabel="Status" value={status} onChange={setStatus} includeAll allLabel="All statuses" options={['On Time', 'Delayed', 'Cancelled', 'Completed']} />
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle="No services match this filter" emptyDescription="Add a demonstration shuttle service to get started." />
      </Panel>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Edit ${editing.name}` : 'Add shuttle service'}
        description="Demonstration transport record."
        fields={fields}
        initialValues={editing || { status: 'On Time', capacity: 44, booked: 0, operating_days: 'Daily', vehicle: 'Coach 12' }}
        onSubmit={submit}
        submitLabel={editing ? 'Save service' : 'Add service'}
      />
    </div>
  );
}