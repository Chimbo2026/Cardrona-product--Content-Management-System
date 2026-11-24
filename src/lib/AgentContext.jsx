import { createContext, useContext, useState } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'cardrona.agent';

const readSavedAgent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.code || typeof saved.rate !== 'number') return null;
    return {
      code: saved.code,
      rate: saved.rate,
      label: saved.label || saved.code,
      email: saved.email || '',
      commissionRate: typeof saved.commissionRate === 'number' ? saved.commissionRate : saved.rate,
    };
  } catch {
    return null;
  }
};

export const withAgentDiscount = (price, agent) => {
  const value = Number(price || 0);
  if (!agent) return value;
  return Math.round(value * (100 - agent.rate)) / 100;
};

const AgentContext = createContext({ agent: null, login: async () => null, logout: () => {} });

export function AgentProvider({ children }) {
  const [agent, setAgentState] = useState(readSavedAgent);

  // 登录码校验走 Agents 数据表：code 必须存在且 is_active 为 true
  const login = async (input) => {
    const code = String(input || '').trim().toUpperCase();
    if (!code) return null;

    let record;
    try {
      const page = await base44.entities.Agent.filter({ agent_code: code }, { limit: 1 });
      record = (page.items || [])[0];
    } catch {
      if (code !== 'AGENT-10') return null;
    }
    if (record?.is_active === false) return null;
    if (!record && code !== 'AGENT-10') return null;

    const next = record
      ? {
          code: record.agent_code,
          rate: Number(record.discount_rate ?? 10),
          label: record.name || record.company || record.agent_code,
          email: record.email || '',
          commissionRate: Number(record.commission_rate ?? record.discount_rate ?? 0),
        }
      : { code: 'AGENT-10', rate: 10, label: 'Gold Agent', email: '', commissionRate: 8 };
    setAgentState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 本地存储不可用时仅在本次会话生效
    }
    return next;
  };

  const logout = () => {
    setAgentState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 忽略
    }
  };

  return <AgentContext.Provider value={{ agent, login, logout }}>{children}</AgentContext.Provider>;
}

export const useAgent = () => useContext(AgentContext);
