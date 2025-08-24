import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Shield,
  RotateCcw,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';

// サンプル商品データ
const sampleProduct: Product = {
  id: '1',
  name: 'プレミアム ワイヤレスヘッドフォン',
  description: `このワイヤレスヘッドフォンは、最先端のノイズキャンセリング技術を搭載し、
  クリアで豊かな音質を提供します。長時間の使用でも疲れにくい軽量設計で、
  通勤、通学、リモートワークに最適です。

  【主な特徴】
  • アクティブノイズキャンセリング機能
  • 最大30時間の連続再生
  • 急速充電対応（15分充電で3時間再生）
  • IPX4防水規格対応
  • マルチデバイス接続対応`,
  shortDescription: '高音質ノイズキャンセリングヘッドフォン',
  price: 29800,
  salePrice: 24800,
  images: [
    {
      id: '1',
      url: '/images/headphones-1.jpg',
      alt: 'ヘッドフォン正面',
      isPrimary: true,
      order: 1,
    },
    {
      id: '2',
      url: '/images/headphones-2.jpg',
      alt: 'ヘッドフォン側面',
      isPrimary: false,
      order: 2,
    },
    {
      id: '3',
      url: '/images/headphones-3.jpg',
      alt: 'ヘッドフォン折りたたみ',
      isPrimary: false,
      order: 3,
    },
  ],
  category: { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
  tags: ['ワイヤレス', 'ノイズキャンセリング', 'プレミアム'],
  sku: 'HP001',
  stock: 45,
  isActive: true,
  attributes: [
    { id: '1', name: 'カラー', value: 'ブラック', type: 'text' },
    { id: '2', name: '重量', value: '250g', type: 'text' },
    { id: '3', name: 'バッテリー', value: '30時間', type: 'text' },
  ],
  ratings: [
    {
      id: '1',
      userId: '1',
      userName: '田中太郎',
      rating: 5,
      comment: '音質が素晴らしく、ノイズキャンセリングも効果的です。',
      createdAt: new Date('2024-01-20'),
    },
    {
      id: '2',
      userId: '2',
      userName: '佐藤花子',
      rating: 4,
      comment: 'デザインも良く、長時間つけても疲れません。',
      createdAt: new Date('2024-01-18'),
    },
  ],
  averageRating: 4.5,
  reviewCount: 128,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 商品データの読み込み
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        // 実際の実装では API からデータを取得
        // const response = await productApi.getProduct(id);

        // サンプルデータを使用
        if (id === '1') {
          setProduct(sampleProduct);
        } else {
          throw new Error('商品が見つかりません');
        }
      } catch (error) {
        console.error('商品読み込みエラー:', error);
        toast({
          title: 'エラー',
          description: '商品の読み込みに失敗しました',
          variant: 'destructive',
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, navigate, toast]);

  // 価格フォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 評価の星表示
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${starSize} ${
          index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // カートに追加
  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
  };

  // ウィッシュリストの切り替え
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'ウィッシュリストから削除' : 'ウィッシュリストに追加',
      description: `${product?.name}を${isWishlisted ? '削除' : '追加'}しました`,
    });
  };

  // 画像ナビゲーション
  const handlePreviousImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // 数量変更
  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    if (newQuantity < 1 || newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">商品が見つかりません</h3>
          <Button onClick={() => navigate('/products')}>商品一覧に戻る</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="p-0 h-auto font-normal"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            商品一覧に戻る
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 商品画像 */}
          <div className="space-y-4">
            {/* メイン画像 */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              {product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDhIMTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {/* ナビゲーションボタン */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* セールバッジ */}
              {product.salePrice && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">セール</Badge>
              )}
            </div>

            {/* サムネイル画像 */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 商品情報 */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category.name}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.shortDescription}</p>
            </div>

            {/* 評価 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.averageRating, 'md')}
                <span className="text-lg font-medium ml-2">{product.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">({product.reviewCount}件のレビュー)</span>
            </div>

            {/* 価格 */}
            <div className="space-y-2">
              {product.salePrice ? (
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="text-sm text-green-600">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}%オフ
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* タグ */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* 在庫状況 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="text-sm">在庫状況:</span>
                <Badge
                  variant={
                    product.stock > 10 ? 'default' : product.stock > 0 ? 'outline' : 'destructive'
                  }
                >
                  {product.stock > 10
                    ? '在庫あり'
                    : product.stock > 0
                      ? `残り${product.stock}個`
                      : '在庫切れ'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">SKU: {product.sku}</div>
            </div>

            {/* 数量選択とカート追加 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">数量:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartLoading}
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 配送・保証情報 */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>5,000円以上で送料無料</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <RotateCcw className="h-4 w-4 text-green-600" />
                <span>30日間返品・交換保証</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-4 w-4 text-purple-600" />
                <span>1年間メーカー保証</span>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報タブ */}
        <Card>
          <Tabs defaultValue="description" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">商品説明</TabsTrigger>
                <TabsTrigger value="specifications">仕様</TabsTrigger>
                <TabsTrigger value="reviews">レビュー ({product.reviewCount})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="description" className="space-y-4">
                <div className="prose max-w-none">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{attr.name}:</span>
                      <span>{attr.value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* レビュー概要 */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{product.averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mb-1">
                      {renderStars(product.averageRating)}
                    </div>
                    <div className="text-sm text-gray-500">{product.reviewCount}件のレビュー</div>
                  </div>
                </div>

                <Separator />

                {/* レビュー一覧 */}
                <div className="space-y-6">
                  {product.ratings.map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              参考になった
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              返信
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>

                {/* レビュー投稿ボタン */}
                <div className="text-center">
                  <Button variant="outline">レビューを投稿する</Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailPage;
