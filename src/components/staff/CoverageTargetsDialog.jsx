import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function CoverageTargetsDialog({ open, onOpenChange, requirements, onSaved }) {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRows(requirements.map((r) => ({ ...r })));
  }, [open, requirements]);

  const setMin = (id, value) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, min_staff: value } : r)));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.CoverageRequirement.bulkUpdate(
        rows.map((r) => ({ id: r.id, min_staff: Math.max(0, Number(r.min_staff) || 0) }))
      );
      toast({ title: 'Coverage targets saved', description: 'Roster alerts recalculated from the new minimums' });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: 'Could not save targets', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const departments = [...new Set(rows.map((r) => r.department))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Minimum staffing levels</DialogTitle>
        </DialogHeader>
        <p className="text-[12px] text-muted-foreground">
          Set the minimum number of rostered staff for each department and shift window. Shifts below the
          target raise a coverage alert.
        </p>
        <div className="space-y-3">
          {departments.map((dep) => (
            <div key={dep} className="rounded-lg border border-border/70 px-3 py-2.5">
              <p className="mb-1.5 text-[12px] font-semibold text-forest-900">{dep}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {rows.filter((r) => r.department === dep).map((r) => (
                  <label key={r.id} className="flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                    <span>{r.shift_label} <span className="num">({r.start_time}–{r.end_time})</span></span>
                    <Input
                      type="number"
                      min={0}
                      value={r.min_staff}
                      onChange={(e) => setMin(r.id, e.target.value)}
                      className="h-8 w-16 text-center"
                      aria-label={`${dep} ${r.shift_label} minimum staff`}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save targets'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}