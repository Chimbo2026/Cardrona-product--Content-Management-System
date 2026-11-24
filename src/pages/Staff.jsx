import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Plus, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import { SelectNative, SearchInput, DemoChip } from '@/components/common/Controls';
import WeekGrid from '@/components/staff/WeekGrid';
import ShiftDialog from '@/components/staff/ShiftDialog';
import StaffDialog from '@/components/staff/StaffDialog';
import CoverageTargetsDialog from '@/components/staff/CoverageTargetsDialog';
import StaffOwnershipSupport from '@/components/staff/StaffOwnershipSupport';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { num, prettyDate, todayISO } from '@/lib/format';
import { isoOf, weekDays } from '@/lib/schedule';
import { computeCoverage } from '@/lib/coverage';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/5e166wDrN0aMNzYx8QZJVX/41f9dba408db0f459e94c44b55d79f29/W24-Mountains_Employment_heroDesktop.webp?w=1600&fm=webp&q=75';

export default function StaffPage() {
  const { can, canViewSensitiveStaff } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('staff', 'write');
  const { toast } = useToast();
  const { items: staff, loading, reload } = useList('Staff', {}, { limit: 300 });
  const { items: shifts, reload: reloadShifts } = useList('Shift', {}, { limit: 900 });
  const { items: requirements, reload: reloadRequirements } = useList('CoverageRequirement', {}, { limit: 100 });
  const { items: attendance } = useList('AttendanceRecord', {}, { limit: 200 });

  const [anchor, setAnchor] = useState(new Date());
  const [department, setDepartment] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftPreset, setShiftPreset] = useState({ staff: null, date: '' });
  const [staffOpen, setStaffOpen] = useState(false);
  const [targetsOpen, setTargetsOpen] = useState(false);

  const today = todayISO();
  const days = weekDays(anchor);
  const weekStart = isoOf(days[0]);
  const weekEnd = isoOf(days[6]);

  const visibleStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff
      .filter((s) => (department === 'All' || s.department === department) && (roleFilter === 'All' || s.role === roleFilter) && (!q || `${s.full_name} ${s.staff_id} ${s.role}`.toLowerCase().includes(q)))
      .sort((a, b) => a.department.localeCompare(b.department) || a.full_name.localeCompare(b.full_name));
  }, [staff, department, roleFilter, search]);

  const visibleIds = new Set(visibleStaff.map((s) => s.staff_id));
  const weekShifts = shifts.filter((s) => s.date >= weekStart && s.date <= weekEnd && visibleIds.has(s.staff_id));
  const todayShifts = shifts.filter((s) => s.date === today && s.status !== 'Cancelled');
  const onDuty = shifts.filter((s) => s.date === today && ['Clocked In', 'Late'].includes(s.status));
  const weekHours = weekShifts.filter((s) => s.status !== 'Cancelled').reduce((sum, s) => sum + (Number(s.hours) || 0), 0);

  const coverage = useMemo(() => computeCoverage(shifts, requirements, today), [shifts, requirements, today]);
  const gaps = coverage.filter((c) => !c.ok);

  const nextStaffId = `EMP-${1200 + staff.length + 1}`;
  const roles = [...new Set(staff.map((s) => s.role).filter(Boolean))].sort();

  const openShift = (shift) => {
    setEditingShift(shift);
    setShiftPreset({ staff: null, date: shift.date });
    setShiftOpen(true);
  };

  const addShift = (staffId, date) => {
    setEditingShift(null);
    setShiftPreset({ staff: staff.find((s) => s.staff_id === staffId) || null, date });
    setShiftOpen(true);
  };

  const clockNow = async (shift, action) => {
    const time = new Date().toTimeString().slice(0, 5);
    if (action === 'in') {
      await base44.entities.Shift.update(shift.id, { status: 'Clocked In', clock_in: time });
      await base44.entities.AttendanceRecord.create({
        staff_id: shift.staff_id, staff_name: shift.staff_name, shift_id: shift.id,
        department: shift.department, date: shift.date, clock_in: time, status: 'Clocked In',
      });
      toast({ title: t('已打卡上岗', 'Clocked in'), description: `${shift.staff_name} · ${time}` });
    } else {
      await base44.entities.Shift.update(shift.id, { status: 'Completed', clock_out: time });
      await base44.entities.AttendanceRecord.create({
        staff_id: shift.staff_id, staff_name: shift.staff_name, shift_id: shift.id,
        department: shift.department, date: shift.date, clock_in: shift.clock_in || shift.start_time,
        clock_out: time, status: 'Completed',
      });
      toast({ title: t('已打卡下班', 'Clocked out'), description: `${shift.staff_name} · ${time}` });
    }
    reloadShifts();
    reload();
  };

  const refreshAll = () => { reloadShifts(); reload(); reloadRequirements(); };

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('人员与运营', 'People & operations')}
        title={t('员工排班', 'Staff roster')}
        description={t('覆盖所有部门的每周班表、打卡记录与人力配置目标。', 'Weekly shifts, clock-in records and coverage targets across every mountain department.')}
        actions={canWrite ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setStaffOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" /> {t('添加员工', 'Add staff')}
            </Button>
            <Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={() => addShift(visibleStaff[0]?.staff_id || '', today)}>
              <Plus className="h-3.5 w-3.5" /> {t('添加班次', 'Add shift')}
            </Button>
          </div>
        ) : null}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('当前在岗', 'Staff on duty now'), num(onDuty.length)],
          [t('今日班次', 'Shifts today'), num(todayShifts.length)],
          [t('低于目标的部门', 'Departments below target'), num(gaps.length)],
          [t('本周排班工时', 'Hours rostered this week'), `${num(weekHours)} h`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="mb-4 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-rose-900">
              {t(`人力预警——今日 ${gaps.length} 个班次时段低于目标人数`, `Coverage alert — ${gaps.length} shift window${gaps.length === 1 ? '' : 's'} below target today`)}
            </p>
            <p className="mt-0.5 text-[11.5px] text-rose-800">
              {gaps.slice(0, 4).map((g) => `${tx(g.department, lang)}·${tx(g.shift_label, lang)}（${g.scheduled}/${g.target}）`).join(' · ')}
              {gaps.length > 4 ? t(` · 另有 ${gaps.length - 4} 项`, ` · +${gaps.length - 4} more`) : ''}
            </p>
          </div>
        </div>
      )}

      <Panel
        title={t('每周班表', 'Weekly shift grid')}
        description={t('周一至周日。点击班次可编辑、改派或记录考勤。', 'Monday to Sunday. Click a shift to edit, reassign or record attendance.')}
        action={<DemoChip>{t('虚构员工数据', 'Fictional staff')}</DemoChip>}
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAnchor(new Date(anchor.getTime() - 7 * 86400000))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-[12px] font-medium text-forest-900">
              {prettyDate(weekStart, 'd MMM')} – {prettyDate(weekEnd, 'd MMM yyyy')}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAnchor(new Date(anchor.getTime() + 7 * 86400000))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-[11.5px]" onClick={() => setAnchor(new Date())}>{t('本周', 'This week')}</Button>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder={t('搜索员工…', 'Search staff…')} className="w-full sm:w-48" />
            <SelectNative ariaLabel={t('部门', 'Department')} value={department} onChange={setDepartment} includeAll allLabel={t('全部部门', 'All departments')} options={[...new Set(staff.map((s) => s.department))].sort().map((v) => ({ value: v, label: tx(v, lang) }))} />
            <SelectNative ariaLabel={t('岗位', 'Role')} value={roleFilter} onChange={setRoleFilter} includeAll allLabel={t('全部岗位', 'All roles')} options={roles} />
          </div>
        </div>
        {loading ? (
          <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">{t('正在加载班表…', 'Loading roster…')}</p>
        ) : visibleStaff.length === 0 ? (
          <div className="p-4"><EmptyState title={t('没有符合条件的员工', 'No staff match this filter')} description={t('请尝试其他部门或清除搜索。', 'Try another department or clear the search.')} /></div>
        ) : (
          <WeekGrid
            staff={visibleStaff}
            shifts={weekShifts}
            anchor={anchor}
            onShiftClick={openShift}
            onAddShift={addShift}
            canWrite={canWrite}
          />
        )}
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title={t('今日人力覆盖', "Today's coverage")}
          description={t('各部门排班人数与配置最低人数对比', 'Rostered staff vs. configured minimum per department')}
          action={canWrite ? (
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setTargetsOpen(true)}>
              {t('编辑配置目标', 'Edit targets')}
            </Button>
          ) : null}
        >
          <ul className="space-y-2">
            {coverage.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-forest-900">{tx(c.department, lang)}</p>
                  <p className="text-[10.5px] text-muted-foreground">{tx(c.shift_label, lang)} · {c.window}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`num text-[12px] font-semibold ${c.ok ? 'text-forest-900' : 'text-rose-600'}`}>
                    {c.scheduled}/{c.target}
                  </span>
                  <StatusBadge status={c.ok ? t('达标', 'On target') : t(`缺 ${c.short} 人`, `Short ${c.short}`)} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t('今日考勤', "Today's attendance")} description={t('来自排班的打卡记录', 'Clock-in records from the roster')} bodyClassName="p-0">
          <div className="max-h-[320px] overflow-y-auto">
            {attendance.length === 0 && <p className="px-4 py-6 text-[12px] text-muted-foreground">{t('今日暂无打卡记录。', 'No clock-ins recorded yet today.')}</p>}
            <ul className="divide-y divide-border/60">
              {attendance.slice(0, 40).map((a) => {
                const shift = shifts.find((s) => s.id === a.shift_id);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-forest-900">{a.staff_name}</p>
                      <p className="text-[10.5px] text-muted-foreground">
                        {tx(a.department, lang)} · {t('上岗', 'in')} {a.clock_in || '—'}{a.clock_out ? ` · ${t('下岗', 'out')} ${a.clock_out}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {canWrite && shift && shift.status === 'Clocked In' && (
                        <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[10.5px]" onClick={() => clockNow(shift, 'out')}>
                          <Clock className="h-3 w-3" /> {t('下班', 'Out')}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>
      </div>

      <Panel title={t('员工名录', 'Staff directory')} description={canViewSensitiveStaff ? t('您的角色可查看联系方式', 'Contact details visible for your role') : t('您的角色无权查看联系方式', 'Contact details restricted for your role')} className="mt-4" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-border/80 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">{t('姓名', 'Name')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('工号', 'Staff ID')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('岗位', 'Role')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('部门', 'Department')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('用工类型', 'Availability')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('联系方式', 'Contact')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('状态', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleStaff.slice(0, 40).map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="px-4 py-2.5 text-[12.5px] font-medium text-forest-900">{s.full_name}</td>
                  <td className="num px-3 py-2.5 text-[11.5px] text-muted-foreground">{s.staff_id}</td>
                  <td className="px-3 py-2.5 text-[11.5px] text-forest-900">{s.role}</td>
                  <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{tx(s.department, lang)}</td>
                  <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{tx(s.availability, lang)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                    {canViewSensitiveStaff ? (s.email || s.phone || '—') : <span className="text-forest-300">{t('受限', 'Restricted')}</span>}
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border/60 px-4 py-2 text-[10.5px] text-muted-foreground">
          {t(`${roles.length} 个岗位 · 员工记录仅为演示示例`, `${roles.length} roles · sample staff records for demonstration only`)}
        </p>
      </Panel>

      <StaffOwnershipSupport />

      <ShiftDialog
        open={shiftOpen}
        onOpenChange={setShiftOpen}
        shift={editingShift}
        staff={staff}
        shifts={shifts}
        defaultDate={shiftPreset.date || today}
        onSaved={refreshAll}
      />
      <StaffDialog open={staffOpen} onOpenChange={setStaffOpen} onSaved={refreshAll} nextId={nextStaffId} />
      <CoverageTargetsDialog open={targetsOpen} onOpenChange={setTargetsOpen} requirements={requirements} onSaved={refreshAll} />
    </div>
  );
}