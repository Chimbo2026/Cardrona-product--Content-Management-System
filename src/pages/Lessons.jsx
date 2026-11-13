import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { SelectNative, SearchInput, DemoChip } from '@/components/common/Controls';
import LessonTable from '@/components/lessons/LessonTable';
import LessonCalendar from '@/components/lessons/LessonCalendar';
import InstructorDirectory from '@/components/lessons/InstructorDirectory';
import LessonDialog from '@/components/lessons/LessonDialog';
import LessonGuestsDialog from '@/components/lessons/LessonGuestsDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { num, todayISO } from '@/lib/format';
import { findConflicts } from '@/lib/schedule';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/ifVoh1VZ1jzfRLPjPgtdi/ae82b8976bb3a0c3419fa5a05cd0b33a/W24-lessons_Imagery-Home_Page_Hero_Image-Desktop.webp?w=1600&fm=webp&q=75';
const TABS = ['Schedule', 'Week calendar', 'Instructors'];

export default function Lessons() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('lessons', 'write');
  const { toast } = useToast();
  const { items: lessons, loading, reload } = useList('Lesson', {}, { sort: 'date', limit: 400 });
  const { items: instructors } = useList('Instructor', {}, { limit: 60 });

  const [tab, setTab] = useState('Schedule');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [day, setDay] = useState('');
  const [anchor, setAnchor] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [presetDate, setPresetDate] = useState('');
  const [guestsFor, setGuestsFor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = todayISO();
  const conflicts = useMemo(() => findConflicts(lessons), [lessons]);
  const conflictIds = useMemo(() => {
    const s = new Set();
    conflicts.forEach(({ a, b }) => { s.add(a.id); s.add(b.id); });
    return s;
  }, [conflicts]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons
      .filter((l) => {
        if (q && !`${l.title} ${l.instructor_name || ''}`.toLowerCase().includes(q)) return false;
        if (type !== 'All' && (l.lesson_category || l.lesson_type) !== type) return false;
        if (level !== 'All' && l.level !== level) return false;
        if (day && l.date !== day) return false;
        return true;
      })
      .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`));
  }, [lessons, search, type, level, day]);

  const todayLessons = lessons.filter((l) => l.date === today && l.status !== 'Cancelled');
  const seats = todayLessons.reduce((s, l) => s + (Number(l.enrolled) || 0), 0);
  const cap = todayLessons.reduce((s, l) => s + (Number(l.capacity) || 0), 0);
  const utilisation = cap ? Math.round((seats / cap) * 100) : 0;

  const openNew = (date = '') => {
    setEditing(null);
    setPresetDate(date || today);
    setFormOpen(true);
  };

  const remove = async () => {
    const l = deleteTarget;
    if (Number(l.enrolled) > 0) {
      await base44.entities.Lesson.update(l.id, { status: 'Cancelled' });
      toast({ title: t('课程已取消', 'Lesson cancelled'), description: t(`${l.title} 保留在记录中，${l.enrolled} 位宾客预订不变`, `${l.title} kept on record with ${l.enrolled} guests preserved`) });
    } else {
      await base44.entities.Lesson.delete(l.id);
      toast({ title: t('课程已删除', 'Lesson removed'), description: `${l.title} · ${l.date}` });
    }
    setDeleteTarget(null);
    reload();
  };

  const tabLabel = { Schedule: t('课程表', 'Schedule'), 'Week calendar': t('周历视图', 'Week calendar'), Instructors: t('教练团队', 'Instructors') };

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('滑雪学校', 'Snow School')}
        title={t('课程与教练管理', 'Lessons & instructors')}
        description={t('涵盖双板与单板的团体课、私教课与儿童课，名额随宾客预订实时更新。', 'Group, private and kids\' lessons across ski and snowboard, capacity managed from live guest reservations.')}
        actions={canWrite ? (
          <Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={() => openNew()}>
            <Plus className="h-3.5 w-3.5" /> {t('新增课程', 'Add lesson')}
          </Button>
        ) : null}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('今日课程', 'Lessons today'), num(todayLessons.length)],
          [t('今日已订名额', 'Seats booked today'), `${num(seats)} / ${num(cap)}`],
          [t('容量使用率', 'Capacity utilisation'), `${utilisation}%`],
          [t('教练时间冲突', 'Instructor overlaps'), num(conflicts.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      {conflicts.length > 0 && (
        <div className="mb-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-[12.5px] font-semibold text-amber-900">{t('教练被分配到时间重叠的课程', 'Instructor assigned to overlapping lessons')}</p>
            <ul className="mt-1 space-y-0.5">
              {conflicts.slice(0, 3).map(({ a, b }) => (
                <li key={a.id + b.id} className="text-[11.5px] text-amber-800">
                  {t(`${a.instructor_name} · ${a.date}：「${a.title}」（${a.start_time}）与「${b.title}」（${b.start_time}）时间重叠`, `${a.instructor_name} · ${a.date}: “${a.title}” (${a.start_time}) overlaps “${b.title}” (${b.start_time})`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-white p-1">
          {TABS.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
                tab === tabKey ? 'bg-forest-900 text-white' : 'text-muted-foreground hover:text-forest-900'
              )}
            >
              {tabLabel[tabKey]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {tab === 'Instructors' ? (
            <DemoChip>{t('评分为示例数据', 'Sample ratings')}</DemoChip>
          ) : (
            <>
              <SearchInput value={search} onChange={setSearch} placeholder={t('搜索课程…', 'Search lessons…')} className="w-full sm:w-52" />
              <SelectNative ariaLabel={t('课程类型', 'Lesson type')} value={type} onChange={setType} includeAll allLabel={t('全部类型', 'All types')} options={['Group', 'Private', 'Kids'].map((v) => ({ value: v, label: tx(v, lang) }))} />
              <SelectNative ariaLabel={t('水平', 'Level')} value={level} onChange={setLevel} includeAll allLabel={t('全部水平', 'All levels')} options={['First Timer', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((v) => ({ value: v, label: tx(v, lang) }))} />
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                aria-label={t('按日期筛选', 'Filter by date')}
                className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-forest-900 shadow-sm outline-none focus:border-ice-400"
              />
            </>
          )}
        </div>
      </div>

      {tab === 'Schedule' && (
        <Panel
          title={t(`课程表（${rows.length}）`, `Lesson schedule (${rows.length})`)}
          description={t('名额随宾客加入或移出自动更新', 'Capacity updates as guests are added or removed')}
          action={<DemoChip>{t('演示课程', 'Demo lessons')}</DemoChip>}
          bodyClassName="p-0"
        >
          {loading ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">{t('正在加载课程…', 'Loading lessons…')}</p>
          ) : (
            <div className="px-4 pb-2 pt-1">
              <LessonTable
                lessons={rows}
                canWrite={canWrite}
                conflictIds={conflictIds}
                onEdit={(l) => { setEditing(l); setFormOpen(true); }}
                onGuests={setGuestsFor}
                onDelete={setDeleteTarget}
              />
            </div>
          )}
        </Panel>
      )}

      {tab === 'Week calendar' && (
        <Panel title={t('课程日历', 'Lesson calendar')} description={t('点击课程可跳转到当天', 'Click a lesson to jump to its day')} bodyClassName="p-4">
          <LessonCalendar
            lessons={lessons}
            anchor={anchor}
            onAnchorChange={setAnchor}
            onSelectDay={(iso) => { setDay(iso); setTab('Schedule'); }}
            onAddOnDay={(iso) => openNew(iso)}
            canWrite={canWrite}
          />
        </Panel>
      )}

      {tab === 'Instructors' && (
        instructors.length === 0 ? (
          <EmptyState icon={CalendarDays} title={t('暂无教练资料', 'No instructors loaded')} description={t('添加教练后，教练档案将显示在这里。', 'Instructor profiles appear here once added.')} />
        ) : (
          <>
            <p className="mb-2 text-[11.5px] text-muted-foreground">
              {t('教练为虚构档案。星级评分与评价数量均为示例演示数据。', 'Fictional profiles. Star ratings and review counts are sample demonstration data.')}
            </p>
            <InstructorDirectory instructors={instructors} lessons={lessons} />
          </>
        )
      )}

      <LessonDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editing}
        instructors={instructors}
        lessons={lessons}
        presetDate={presetDate}
        onSaved={reload}
      />

      <LessonGuestsDialog
        open={!!guestsFor}
        onOpenChange={(v) => !v && setGuestsFor(null)}
        lesson={guestsFor}
        onChanged={reload}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={deleteTarget && Number(deleteTarget.enrolled) > 0 ? t('确认取消该课程？', 'Cancel this lesson?') : t('确认删除该课程？', 'Delete this lesson?')}
        description={
          deleteTarget
            ? Number(deleteTarget.enrolled) > 0
              ? t(`${deleteTarget.title} 已有 ${deleteTarget.enrolled} 位宾客预订。课程将被取消，所有宾客预订记录予以保留。`, `${deleteTarget.title} has ${deleteTarget.enrolled} guest(s) booked. The lesson will be cancelled and every guest reservation kept on record.`)
              : t(`${deleteTarget.title}（${deleteTarget.date}）暂无宾客预订，将被永久删除。`, `${deleteTarget.title} on ${deleteTarget.date} has no guest reservations and will be permanently removed.`)
            : ''
        }
        confirmLabel={deleteTarget && Number(deleteTarget.enrolled) > 0 ? t('取消课程', 'Cancel lesson') : t('删除课程', 'Delete lesson')}
        onConfirm={remove}
      />
    </div>
  );
}