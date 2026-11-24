import { useState } from 'react';
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AgentAccessCard() {
  const { bi } = useLanguage();
  const { agent, login, logout } = useAgent();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const record = await login(code);
    if (!record) {
      setError(bi('代理码无效，请向运营确认', 'That agent code is not valid'));
      return;
    }
    setError('');
    setCode('');
  };

  if (agent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <p className="text-[12px] font-medium text-emerald-900">
            {bi('代理登录中', 'Agent signed in')} · {agent.label}
          </p>
          <button
            type="button"
            onClick={logout}
            className="ml-auto flex items-center gap-1 rounded-full border border-emerald-300 px-2.5 py-1 text-[10px] text-emerald-800"
          >
            <LogOut className="h-3 w-3" /> {bi('退出登录', 'Sign out')}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-emerald-900/80">
          <span className="font-mono tracking-wider">{agent.code}</span> ·{' '}
          {bi(`协议折扣 -${agent.rate}%`, `${agent.rate}% agent rate`)}
          {bi(
            '，全站雪票、课程与商品自动套用代理价。',
            '. Agent pricing applies to passes, lessons and shop items automatically.',
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 font-heading text-[14px]">
        <KeyRound className="h-4 w-4 text-primary" /> {bi('代理登录', 'Agent sign in')}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {bi(
          '输入运营分配的代理码，登录后全站显示协议价格。',
          'Enter the agent code you were given to see your contracted prices.',
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <Input
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError('');
          }}
          placeholder="AGENT-10"
          autoCapitalize="characters"
          className="h-10 font-mono uppercase"
        />
        <Button type="submit" className="h-10 rounded-full px-5" disabled={!code.trim()}>
          {bi('登录', 'Sign in')}
        </Button>
      </div>
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      <p className="mt-2 text-[10px] text-muted-foreground">
        {bi('演示代理码：AGENT-5 · AGENT-10 · AGENT-15', 'Demo agent codes: AGENT-5 · AGENT-10 · AGENT-15')}
      </p>
    </form>
  );
}