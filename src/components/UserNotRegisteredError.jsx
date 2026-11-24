import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const UserNotRegisteredError = () => {
  const { bi } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {bi('暂无访问权限', 'No access yet')}
          </h1>
          <p className="text-slate-600 mb-8">
            {bi(
              '你的账号尚未加入本应用。请联系管理员为你开通访问权限。',
              'Your account has not been added to this app. Ask an administrator for access.',
            )}
          </p>
          <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
            <p>{bi('如果认为这是误判，可以尝试：', 'If you think this is a mistake, try:')}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{bi('确认当前登录的账号是否正确', 'Check you signed in with the right account')}</li>
              <li>{bi('联系管理员申请开通权限', 'Ask an administrator to grant access')}</li>
              <li>{bi('退出后重新登录', 'Sign out and sign in again')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;