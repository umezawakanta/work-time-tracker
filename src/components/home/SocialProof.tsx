import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

const testimonials: Testimonial[] = [
  {
    name: 'Kenji S.',
    role: 'スタートアップ創業者',
    quote: '毎朝1分で「今日の一手」を決められる。タスクが勝手に前に進む感覚が初めてでした。',
    avatarUrl: '/images/avatars/avatar-1.png',
    rating: 5,
  },
  {
    name: 'Mika T.',
    role: 'プロダクトマネージャー',
    quote: '仕事/学習/自己診断が1つにまとまり、意思決定が速くなった。WebでもPWAでも同じ体験。',
    avatarUrl: '/images/avatars/avatar-2.png',
    rating: 5,
  },
  {
    name: 'Hiro A.',
    role: 'フリーランスエンジニア',
    quote: 'オフラインでも使えるので移動中に計画→自宅で集中。小さな成功が毎日積み上がる。',
    avatarUrl: '/images/avatars/avatar-3.png',
    rating: 5,
  },
];

const renderStars = (count: number): React.ReactNode => {
  const stars = Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={'w-4 h-4 ' + (i < count ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300')}
      aria-hidden="true"
    />
  ));
  return (
    <div className="flex items-center gap-1" aria-label={`5点満点中 ${count} 点`}>
      {stars}
    </div>
  );
};

const SocialProof: React.FC = () => {
  return (
    <section
      className="container mx-auto px-4 max-w-7xl py-8"
      aria-labelledby="social-proof-heading"
    >
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-emerald-600">利用者の声</p>
        <h2 id="social-proof-heading" className="text-2xl md:text-3xl font-bold text-gray-900">
          1分の一歩が、習慣になる
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          実際のユーザーが感じた変化をご紹介します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <Card key={t.name} className="bg-white/80 border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  {t.avatarUrl ? (
                    <AvatarImage src={t.avatarUrl} alt={`${t.name}のアバター`} />
                  ) : (
                    <AvatarFallback aria-hidden="true">
                      {t.name
                        .split(' ')
                        .map((s) => s[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-600">{t.role}</div>
                </div>
                <div className="ml-auto">{renderStars(t.rating)}</div>
              </div>
              <blockquote className="text-sm text-gray-700 leading-relaxed">“{t.quote}”</blockquote>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        実名・匿名どちらでも利用可。個人情報は最小限の設計です。
      </div>
    </section>
  );
};

export default SocialProof;
