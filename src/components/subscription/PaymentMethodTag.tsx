// src/components/subscription/PaymentMethodTag.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building, DollarSign, SmartphoneIcon } from 'lucide-react';

interface PaymentMethodTagProps {
  method: string;
}

const PaymentMethodTag: React.FC<PaymentMethodTagProps> = ({ method }) => {
  const methods = {
    credit: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <CreditCard className="h-3 w-3 mr-1" />,
      label: 'カード',
    },
    bank: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <Building className="h-3 w-3 mr-1" />,
      label: '銀行振替',
    },
    paypal: {
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <DollarSign className="h-3 w-3 mr-1" />,
      label: 'PayPal',
    },
    apple: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <SmartphoneIcon className="h-3 w-3 mr-1" />,
      label: 'Apple',
    },
    google: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <SmartphoneIcon className="h-3 w-3 mr-1" />,
      label: 'Google',
    },
  };

  const { color, icon, label } = methods[method as keyof typeof methods] || methods.credit;

  return (
    <Badge
      variant="outline"
      className={`${color} flex items-center text-xs font-normal py-0.5 px-1.5`}
    >
      {icon}
      {label}
    </Badge>
  );
};

export default PaymentMethodTag;
