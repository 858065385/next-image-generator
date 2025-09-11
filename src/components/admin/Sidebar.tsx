'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navGroups = [
  {
    label: '主要功能',
    items: [
      { href: '/admin', label: '仪表盘' },
      { href: '/admin/user-management', label: '用户管理' },
      { href: '/admin/data-statistics', label: '数据统计' },
      { href: '/admin/operation-logs', label: '操作日志' },
      { href: '/admin/subscription-debug', label: '订阅调试' },
    ]
  },
  {
    label: '用户相关',
    items: [
      { href: '/admin/users', label: '用户列表' },
      { href: '/admin/dashboard', label: '用户仪表盘' },
      { href: '/admin/test-auth', label: '认证测试' },
    ]
  },
  {
    label: '订阅与支付',
    items: [
      { href: '/admin/test-payment', label: '支付测试' },
      { href: '/admin/payment-result', label: '支付结果' },
    ]
  },
  {
    label: '系统管理',
    items: [
      { href: '/admin/settings', label: '系统设置' },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  
  return (
    <aside className={`h-screen border-r bg-white ${collapsed ? 'w-16' : 'w-64'} transition-all overflow-y-auto`}>
      <div className="h-14 flex items-center px-3 border-b">
        <button onClick={onToggle} className="text-sm">☰</button>
        {!collapsed && <span className="ml-2 font-semibold">管理后台</span>}
      </div>
      <nav className="p-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href.replace('[id]', ''));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`block px-3 py-2 rounded text-sm ${
                    active 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${collapsed ? 'text-center' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
