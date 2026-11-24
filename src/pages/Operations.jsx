import { useState } from 'react';
import {
  AlertTriangle,
  CloudSnow,
  Eye,
  Mountain,
  Snowflake,
  Thermometer,
  Wind,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { SelectNative } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { num, prettyDate, prettyDateTime, todayISO } from '@/lib/format';
import { LIFT_STATUSES, PRIORITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const INCIDENT_TYPES = ['Safety', 'Injury', 'Equipment', 'Weather', 'Guest', 'Facility'];

export default function Operations() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('operations', 'write');
  const { toast } = useToast();
  const today = todayISO();

  const { items: lifts, reload: reloadLifts } = useList('Lift', {}, { sort: 'name', limit: 50 });
  const { items: trails, reload: reloadTrails } = useList('Trail', {}, { sort: 'area', limit: 100 });
  const { items: weather, reload: reloadWeather } = useList('WeatherReport', {}, { sort: '-recorded_at', limit: 10 });
  const { items: incidents, reload: reloadIncidents } = useList('Incident', {}, { sort: '-reported_at', limit: 100 });
  const { items: checklist, reload: reloadChecklist } = useList('ChecklistTask', { date: today }, { limit: 50 });

  const [weatherOpen, setWeatherOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [noteLift, setNoteLift] = useState(null);
  const [note, setNote] = useState('');

  const current = weather[0];
  const openIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const liftsOpen = lifts.filter((l) => l.status === 'Open').length;
  const trailsOpen = trails.filter((tr) => tr.status === 'Open').length;
  const done = checklist.filter((c) => c.completed).length;

  const liftIcon = (status) =>
    status === 'Open' ? 'bg-emerald-50 text-emerald-700' : status === 'Delayed' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700';

  const setLiftStatus = async (lift, status) => {
    await base44.entities.Lift.update(lift.id, { status, updated_by: 'Demo operations manager' });
    toast({ title: t(`${lift.name} 状态已更新为「${tx(status, lang)}」`, `${lift.name} set to ${status}`), description: t('状态板已同步至所有员工视图。', 'Status board updated for all staff views.') });
    reloadLifts();
  };

  const setTrailStatus = async (trail, status) => {
    await base44.entities.Trail.update(trail.id, { status });
    toast({ title: t(`${trail.name} 状态已更新为「${tx(status, lang)}」`, `${trail.name} set to ${status}`), description: t('雪道状态已更新。', 'Trail status updated.') });
    reloadTrails();
  };

  const saveNote = async () => {
    await base44.entities.Lift.update(noteLift.id, { note, updated_by: 'Demo operations manager' });
    toast({ title: t('运营备注已保存', 'Operational note saved'), description: noteLift.name });
    setNoteLift(null);
    reloadLifts();
  };

  const toggleChecklist = async (task) => {
    await base44.entities.ChecklistTask.update(task.id, {
      completed: !task.completed,
      completed_by: !task.completed ? 'Demo operations manager' : '',
    });
    reloadChecklist();
  };

  const resolveIncident = async (incident) => {
    await base44.entities.Incident.update(incident.id, { status: 'Resolved', resolution: incident.resolution || 'Resolved by duty manager.' });
    toast({ title: t('事件已解决', 'Incident resolved'), description: incident.title });
    reloadIncidents();
  };

  const weatherFields = [
    { name: 'temp_c', label: t('气温 (°C)', 'Temperature (°C)'), type: 'number', required: true },
    { name: 'feels_like_c', label: t('体感温度 (°C)', 'Feels like (°C)'), type: 'number' },
    { name: 'wind_kmh', label: t('风速 (km/h)', 'Wind speed (km/h)'), type: 'number' },
    { name: 'wind_direction', label: t('风向', 'Wind direction'), type: 'select', options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
    { name: 'visibility', label: t('能见度', 'Visibility'), type: 'select', options: ['Excellent', 'Good', 'Moderate', 'Poor'] },
    { name: 'snow_depth_cm', label: t('雪基厚度 (cm)', 'Snow base (cm)'), type: 'number' },
    { name: 'new_snow_cm', label: t('24小时新增降雪 (cm)', 'New snow 24h (cm)'), type: 'number' },
    {
      name: 'conditions',
      label: t('天气状况', 'Conditions'),
      type: 'select',
      required: true,
      options: ['Sunny', 'Fine', 'Partly cloudy', 'Overcast', 'Light snow', 'Snow showers', 'Heavy snow', 'Wind hold'].map((v) => ({ value: v, label: tx(v, lang) })),
    },
    { name: 'notes', label: t('观测备注', 'Observation notes'), type: 'textarea', colSpan: 2 },
  ];

  const incidentFields = [
    { name: 'title', label: t('事件标题', 'Incident title'), required: true, colSpan: 2 },
    { name: 'incident_type', label: t('类型', 'Type'), type: 'select', required: true, options: INCIDENT_TYPES.map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'severity', label: t('严重程度', 'Severity'), type: 'select', required: true, options: PRIORITIES.map((v) => ({ value: v, label: tx(v, lang) })) },
    {
      name: 'status',
      label: t('状态', 'Status'),
      type: 'select',
      required: true,
      options: [
        { value: 'Open', label: t('待处理', 'Open') },
        { value: 'Investigating', label: t('调查中', 'Investigating') },
        { value: 'Resolved', label: t('已解决', 'Resolved') },
      ],
    },
    { name: 'location', label: t('位置', 'Location'), type: 'text' },
    { name: 'reported_by', label: t('上报人', 'Reported by'), type: 'text' },
    { name: 'related_asset', label: t('关联资产', 'Related asset'), type: 'text' },
    { name: 'description', label: t('描述', 'Description'), type: 'textarea', required: true, colSpan: 2 },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t('山地运营', 'Mountain operations')}
        title={t('运行控制中心', 'Operational control centre')}
        description={t('当日缆车、雪道、天气与安全记录（模拟数据）。状态变更将写入演示记录。', 'Simulated lift, trail, weather and safety records for the day. Status changes are logged against demo records.')}
        actions={
          canWrite ? (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWeatherOpen(true)}>
                {t('记录观测', 'Log observation')}
              </Button>
            </>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('开放缆车', 'Lifts open'), `${liftsOpen} / ${lifts.length}`],
          [t('开放雪道', 'Trails open'), `${trailsOpen} / ${trails.length}`],
          [t('未结事件', 'Open incidents'), num(openIncidents.length)],
          [t('清单完成', 'Checklist complete'), `${done} / ${checklist.length}`],
        ].map(([label, value], i) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className={cn('num mt-1 text-[19px] font-semibold', i === 2 && openIncidents.length > 0 ? 'text-rose-600' : 'text-forest-950')}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel
          title={t('天气与雪情观测', 'Weather & snow observation')}
          description={t('模拟数据——非实时数据源', 'Simulated data — not a live feed')}
          className="xl:col-span-2"
          action={<span className="rounded-md border border-ice-200 bg-ice-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ice-800">{t('模拟数据', 'Simulated')}</span>}
        >
          {!current ? (
            <p className="py-6 text-center text-[12.5px] text-muted-foreground">{t('暂无观测记录。', 'No observations logged yet.')}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                  { icon: Thermometer, label: t('气温', 'Temperature'), value: `${current.temp_c}°C`, meta: t(`体感 ${current.feels_like_c ?? '—'}°C`, `feels ${current.feels_like_c ?? '—'}°C`) },
                  { icon: Snowflake, label: t('雪基厚度', 'Snow base'), value: `${current.snow_depth_cm} cm`, meta: t(`24小时 +${current.new_snow_cm ?? 0} cm`, `+${current.new_snow_cm ?? 0} cm 24h`) },
                  { icon: Wind, label: t('风速', 'Wind'), value: `${current.wind_kmh} km/h`, meta: current.wind_direction || '—' },
                  { icon: Eye, label: t('能见度', 'Visibility'), value: current.visibility ? tx(current.visibility, lang) : '—', meta: tx(current.conditions, lang) },
                  { icon: CloudSnow, label: t('记录时间', 'Recorded'), value: prettyDate(current.recorded_at), meta: prettyDateTime(current.recorded_at) },
                ].map((w) => (
                  <div key={w.label}>
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      <w.icon className="h-3 w-3" /> {w.label}
                    </p>
                    <p className="num mt-1 text-[17px] font-semibold text-forest-950">{w.value}</p>
                    <p className="text-[10.5px] text-muted-foreground">{w.meta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border/70 pt-3">
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('近期观测', 'Recent observations')}</p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {weather.slice(1, 5).map((w) => (
                    <li key={w.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-muted-foreground">{prettyDate(w.recorded_at)}</span>
                      <span className="text-forest-900">{tx(w.conditions, lang)} · {w.temp_c}°C · {w.snow_depth_cm} cm</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Panel>

        <Panel title={t('安全预警', 'Safety alerts')} description={t(`${openIncidents.length} 起未结`, `${openIncidents.length} unresolved`)} bodyClassName="p-0">
          <ul className="max-h-[320px] overflow-y-auto">
            {openIncidents.length === 0 && (
              <li className="px-4 py-8 text-center text-[12px] text-muted-foreground">{t('暂无未结事件，一切正常。', 'No open incidents. All clear.')}</li>
            )}
            {openIncidents.slice(0, 6).map((i) => (
              <li key={i.id} className="border-b border-border/60 px-4 py-3 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-medium leading-snug text-forest-900">{i.title}</p>
                  <StatusBadge status={i.severity} dot={false} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{i.location} · {prettyDate(i.reported_at)}</p>
                {canWrite && (
                  <Button variant="ghost" size="sm" className="mt-1 h-6 px-1.5 text-[11px] text-forest-700" onClick={() => resolveIncident(i)}>
                    {t('标记为已解决', 'Mark resolved')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title={t('缆车状态板', 'Lift status board')} description={t('授权管理者可更新缆车状态并添加运营备注', 'Authorised managers can update lift status and add operational notes')}>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {lifts.map((l) => (
              <div key={l.id} className="rounded-lg border border-border/80 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('rounded-lg p-1.5', liftIcon(l.status))}>
                    <Mountain className="h-3.5 w-3.5" />
                  </span>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 truncate text-[12.5px] font-semibold text-forest-900">{l.name}</p>
                <p className="text-[10.5px] text-muted-foreground">{tx(l.lift_type, lang)} · {num(l.capacity_per_hour)}{t(' 人/小时', '/hr')}</p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">{t(`开放时间 ${l.opened_at || '—'}`, `Opens ${l.opened_at || '—'}`)}</p>
                {l.note && <p className="mt-1 line-clamp-2 text-[10.5px] italic text-amber-700">{l.note}</p>}
                {canWrite && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <SelectNative ariaLabel={t(`${l.name} 状态`, `Status for ${l.name}`)} value={l.status} onChange={(v) => setLiftStatus(l, v)} options={LIFT_STATUSES.map((v) => ({ value: v, label: tx(v, lang) }))} className="h-7 flex-1 text-[11px]" />
                    <Button variant="outline" size="sm" className="h-7 px-1.5 text-[10.5px]" onClick={() => { setNoteLift(l); setNote(l.note || ''); }}>
                      {t('备注', 'Note')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title={t('雪道与地形', 'Trails & terrain')} description={t('按区域查看状态', 'Status by basin')} className="xl:col-span-2" bodyClassName="p-0">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-muted/70">
                <tr>
                  {[t('雪道', 'Trail'), t('难度', 'Difficulty'), t('区域', 'Area'), t('长度', 'Length'), t('状态', 'Status')].map((h, i) => (
                    <th key={i} className="px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trails.map((tr) => (
                  <tr key={tr.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 text-[12.5px] font-medium text-forest-900">{tr.name}</td>
                    <td className="px-4 py-2 text-[11.5px] text-muted-foreground">{tx(tr.difficulty, lang)}</td>
                    <td className="px-4 py-2 text-[11.5px] text-muted-foreground">{tr.area}</td>
                    <td className="num px-4 py-2 text-[11.5px] text-muted-foreground">{tr.length_km} km</td>
                    <td className="px-4 py-2">
                      {canWrite ? (
                        <SelectNative ariaLabel={t(`${tr.name} 状态`, `Status for ${tr.name}`)} value={tr.status} onChange={(v) => setTrailStatus(tr, v)} options={LIFT_STATUSES.map((v) => ({ value: v, label: tx(v, lang) }))} className="h-7 text-[11px]" />
                      ) : (
                        <StatusBadge status={tr.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={t('每日检查清单', 'Daily checklists')} description={`${prettyDate(today)} · ${t(`${done}/${checklist.length} 已完成`, `${done}/${checklist.length} complete`)}`}>
          <div className="space-y-4">
            {['Opening', 'Closing'].map((section) => {
              const items = checklist.filter((c) => c.section === section);
              return (
                <div key={section}>
                  <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {section === 'Opening' ? t('开园准备', 'Opening') : t('闭园收尾', 'Closing')}
                  </p>
                  <ul className="space-y-1">
                    {items.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => canWrite && toggleChecklist(c)}
                          disabled={!canWrite}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors',
                            canWrite && 'hover:bg-forest-50'
                          )}
                        >
                          {c.completed ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                          )}
                          <span className={cn('text-[11.5px] leading-snug', c.completed ? 'text-muted-foreground line-through' : 'text-forest-900')}>
                            {c.title}
                          </span>
                        </button>
                      </li>
                    ))}
                    {items.length === 0 && <li className="text-[11px] text-muted-foreground">{t('暂未配置任务。', 'No tasks configured.')}</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/70 bg-white/70 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-[11.5px] text-muted-foreground">
          {t('本页天气、雪情、缆车与雪道信息均为模拟演示数据，未连接任何实时度假村、雪崩安全或缆车控制系统。', 'Weather, snow, lift and trail information on this page is simulated demonstration data. No live resort, snow safety or lift control system is connected.')}
        </p>
      </div>

      <RecordFormDialog
        open={weatherOpen}
        onOpenChange={setWeatherOpen}
        title={t('记录天气与雪情观测', 'Log weather & snow observation')}
        description={t('模拟观测将写入演示数据。', 'Simulated observation recorded against demo data.')}
        fields={weatherFields}
        initialValues={{
          temp_c: current?.temp_c ?? 0,
          wind_kmh: current?.wind_kmh ?? 0,
          wind_direction: current?.wind_direction || 'NW',
          visibility: current?.visibility || 'Good',
          snow_depth_cm: current?.snow_depth_cm ?? 0,
          new_snow_cm: 0,
          conditions: 'Fine',
          source: 'Simulated observation',
        }}
        onSubmit={async (values) => {
          await base44.entities.WeatherReport.create({ ...values, recorded_at: new Date().toISOString(), source: 'Simulated observation' });
          toast({ title: t('观测已记录', 'Observation logged'), description: `${tx(values.conditions, lang)} · ${values.temp_c}°C` });
          reloadWeather();
        }}
        submitLabel={t('记录观测', 'Log observation')}
      />

      <RecordFormDialog
        open={incidentOpen}
        onOpenChange={setIncidentOpen}
        title={t('上报事件', 'Report an incident')}
        description={t('仅创建演示事件记录。', 'Demo incident records only.')}
        fields={incidentFields}
        initialValues={{ status: 'Open', severity: 'Medium', incident_type: 'Safety', reported_by: 'Demo operations manager' }}
        onSubmit={async (values) => {
          await base44.entities.Incident.create({ ...values, reported_at: new Date().toISOString() });
          toast({ title: t('事件已记录', 'Incident logged'), description: values.title });
          reloadIncidents();
        }}
        submitLabel={t('记录事件', 'Log incident')}
      />

      <Dialog open={!!noteLift} onOpenChange={(v) => !v && setNoteLift(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('运营备注', 'Operational note')} · {noteLift?.name}</DialogTitle>
          </DialogHeader>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder={t('例如：11:00 因风评估停运，夜间安排压雪', 'e.g. wind hold assessment at 11:00, grooming scheduled overnight')} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteLift(null)}>{t('取消', 'Cancel')}</Button>
            <Button onClick={saveNote}>{t('保存备注', 'Save note')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}