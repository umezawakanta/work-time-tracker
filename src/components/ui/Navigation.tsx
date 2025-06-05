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

  return <div>{/* Render your navigation items here */}</div>;
};

export default Navigation;
