import { useState } from 'react';
import { BadgeCheck, LogOut, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AgentLoginCard({ className = 'mt-3 px-4' }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { agent, login, logout } = useAgent();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);

  if (agent) {
    return (
      <section className={className}>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
          <div className="flex items-start gap-2.5">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-emerald-900">
                {t('agent.success', { rate: agent.rate })}
              </p>
              <p className="mt-0.5 text-[10.5px] text-emerald-800/80">
                {agent.label} · <span className="font-mono tracking-wider">{agent.code}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] text-emerald-900"
            >
              <LogOut className="h-3 w-3" /> {t('agent.logout')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const submit = async () => {
    const value = code.trim();
    if (!value || pending) return;
    setPending(true);
    try {
      const record = await login(value);
      if (record) {
        setCode('');
      } else {
        toast({ variant: 'destructive', title: t('agent.error') });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={className}>
      <div className="rounded-2xl border border-border bg-card p-3.5">
        <p className="flex items-center gap-1.5 text-[12px] font-medium">
          <Tag className="h-3.5 w-3.5 text-primary" /> {t('agent.title')}
        </p>
        <div className="mt-2 flex gap-2">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder={t('agent.placeholder')}
            className="h-9 font-mono text-[12px] uppercase"
          />
          <Button
            type="button"
            className="h-9 shrink-0 rounded-xl px-4"
            onClick={submit}
            disabled={pending}
          >
            {t('agent.submit')}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{t('agent.demoHint')}</p>
      </div>
    </section>
  );
}