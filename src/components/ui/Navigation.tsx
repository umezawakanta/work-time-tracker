import React from 'react';
import { Target } from 'lucide-react';

const Navigation: React.FC = () => {
  const navigationItems = [
    {
      title: '欲望制御RPG',
      href: '/abstinence',
      icon: Target,
      description: '禁欲チャレンジでレベルアップ',
    },
  ];

  return (
    <div>
      {navigationItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </a>
      ))}
    </div>
  );
};

export default Navigation;
