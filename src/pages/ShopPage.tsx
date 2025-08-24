import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Package, ShoppingBag } from 'lucide-react';

const ShopPage: React.FC = () => {
  const navigate = useNavigate();

  // おすすめ商品のサンプルデータ
  const featuredProducts = useMemo(
    () => [
      {
        id: '1',
        name: 'プレミアム ワイヤレスヘッドフォン',
        price: 29800,
        salePrice: 24800,
        image: '/images/headphones-1.jpg',
        rating: 4.5,
        reviews: 128,
      },
      {
        id: '2',
        name: 'スマートウォッチ Pro',
        price: 39800,
        image: '/images/smartwatch-1.jpg',
        rating: 4.2,
        reviews: 89,
      },
      {
        id: '3',
        name: 'オーガニック コーヒー豆',
        price: 2980,
        salePrice: 2480,
        image: '/images/coffee-1.jpg',
        rating: 4.7,
        reviews: 234,
      },
    ],
    []
  );

  // 価格フォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 評価の星表示
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            あなたの生活をサポートする
            <br />
            プレミアムな商品
          </h1>
          <p className="text-xl mb-8 opacity-90">
            仕事効率化ツールから日用品まで、厳選された商品をお届けします
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              商品を見る
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              サービスについて
            </Button>
          </div>
        </div>
      </section>

      {/* おすすめ商品セクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">おすすめ商品</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">人気の商品やセール商品をご紹介します</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDhIMTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}

                  {product.salePrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">セール</Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                  {/* 評価 */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">{renderStars(product.rating)}</div>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>

                  {/* 価格 */}
                  <div className="mb-3">
                    {product.salePrice ? (
                      <div>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    詳細を見る
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/products')}>
              すべての商品を見る
            </Button>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">なぜ当ストアを選ぶのか</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              お客様の満足度を最優先に、安心・安全なショッピング体験を提供します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">厳選された商品</h3>
                <p className="text-gray-600">
                  品質と機能性を重視して厳選した商品のみを取り扱っています
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">迅速な配送</h3>
                <p className="text-gray-600">
                  5,000円以上のご注文で送料無料。迅速かつ安全にお届けします
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">安心のサポート</h3>
                <p className="text-gray-600">30日間の返品保証と充実したカスタマーサポートを提供</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
