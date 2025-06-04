import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Heart,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Tag,
  Package,
} from 'lucide-react';
import { Product, ProductCategory, ProductSearchParams } from '@/types/ecommerce';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// サンプル商品データ
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'プレミアム ワイヤレスヘッドフォン',
    description: '高音質でノイズキャンセリング機能付きのワイヤレスヘッドフォンです。',
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
    ],
    category: { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
    tags: ['ワイヤレス', 'ノイズキャンセリング', 'プレミアム'],
    sku: 'HP001',
    stock: 45,
    isActive: true,
    attributes: [],
    ratings: [],
    averageRating: 4.5,
    reviewCount: 128,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'スマートウォッチ Pro',
    description: '健康管理とフィットネス追跡機能を備えたスマートウォッチです。',
    shortDescription: '多機能スマートウォッチ',
    price: 39800,
    images: [
      {
        id: '2',
        url: '/images/smartwatch-1.jpg',
        alt: 'スマートウォッチ',
        isPrimary: true,
        order: 1,
      },
    ],
    category: { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
    tags: ['スマートウォッチ', 'フィットネス', 'ヘルスケア'],
    sku: 'SW001',
    stock: 32,
    isActive: true,
    attributes: [],
    ratings: [],
    averageRating: 4.2,
    reviewCount: 89,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'オーガニック コーヒー豆',
    description: '厳選されたオーガニックコーヒー豆。深いコクと香りが楽しめます。',
    shortDescription: '厳選オーガニックコーヒー豆',
    price: 2980,
    salePrice: 2480,
    images: [
      { id: '3', url: '/images/coffee-1.jpg', alt: 'コーヒー豆', isPrimary: true, order: 1 },
    ],
    category: { id: '2', name: '食品・飲料', slug: 'food-drink', isActive: true, order: 2 },
    tags: ['オーガニック', 'コーヒー', '高品質'],
    sku: 'CF001',
    stock: 78,
    isActive: true,
    attributes: [],
    ratings: [],
    averageRating: 4.7,
    reviewCount: 234,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

const sampleCategories: ProductCategory[] = [
  { id: '1', name: '電子機器', slug: 'electronics', isActive: true, order: 1 },
  { id: '2', name: '食品・飲料', slug: 'food-drink', isActive: true, order: 2 },
  { id: '3', name: 'ファッション', slug: 'fashion', isActive: true, order: 3 },
  { id: '4', name: 'ホーム&ガーデン', slug: 'home-garden', isActive: true, order: 4 },
];

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { toast } = useToast();

  // 状態管理
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(sampleCategories);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // フィルタリングされた商品
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // 検索条件
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      // カテゴリ条件
      const matchesCategory =
        selectedCategory === 'all' || product.category.id === selectedCategory;

      // 価格条件
      const price = product.salePrice || product.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      // タグ条件
      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((tag) => product.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesPrice && matchesTags && product.isActive;
    });

    // ソート
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
          break;
        case 'rating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'created_at':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, sortOrder, selectedTags]);

  // 利用可能なタグの取得
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((product) => {
      product.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [products]);

  // カートに追加
  const handleAddToCart = async (product: Product) => {
    await addToCart(product, 1);
  };

  // 商品詳細ページへ移動
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">商品一覧</h1>
          <p className="text-gray-600">厳選された商品をお探しください</p>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 検索バー */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="商品名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* カテゴリ選択 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ソート */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [sort, order] = value.split('-');
                  setSortBy(sort);
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">名前 (A-Z)</SelectItem>
                  <SelectItem value="name-desc">名前 (Z-A)</SelectItem>
                  <SelectItem value="price-asc">価格 (安い順)</SelectItem>
                  <SelectItem value="price-desc">価格 (高い順)</SelectItem>
                  <SelectItem value="rating-desc">評価 (高い順)</SelectItem>
                  <SelectItem value="created_at-desc">新着順</SelectItem>
                </SelectContent>
              </Select>

              {/* フィルター表示切り替え */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                フィルター
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>

              {/* 表示モード切り替え */}
              <div className="flex">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 詳細フィルター */}
            {showFilters && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 価格範囲 */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">価格範囲</Label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        max={50000}
                        min={0}
                        step={1000}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* タグフィルター */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">タグ</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags([...selectedTags, tag]);
                              } else {
                                setSelectedTags(selectedTags.filter((t) => t !== tag));
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-sm">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* フィルタークリア */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setPriceRange([0, 50000]);
                        setSelectedTags([]);
                      }}
                      className="w-full"
                    >
                      フィルターをクリア
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 結果サマリー */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{filteredProducts.length}件の商品が見つかりました</p>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 商品一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">商品が見つかりません</h3>
              <p className="text-gray-600">検索条件を変更して再度お試しください</p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleProductClick(product.id)}
              >
                <div className={viewMode === 'list' ? 'flex-shrink-0 w-48' : ''}>
                  <div
                    className={`relative ${viewMode === 'list' ? 'h-full' : 'aspect-square'} bg-gray-100`}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDhIMTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-12 w-12" />
                      </div>
                    )}

                    {/* セール バッジ */}
                    {product.salePrice && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">セール</Badge>
                    )}

                    {/* 在庫切れ バッジ */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="destructive">在庫切れ</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex justify-between h-full' : ''}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}

                      {/* 評価 */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">{renderStars(product.averageRating)}</div>
                        <span className="text-sm text-gray-500">({product.reviewCount})</span>
                      </div>

                      {/* タグ */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div
                      className={viewMode === 'list' ? 'flex flex-col justify-between ml-4' : ''}
                    >
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

                      {/* アクションボタン */}
                      <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : ''}`}>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0 || cartLoading}
                          className={viewMode === 'list' ? 'w-full' : 'flex-1'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: 'ウィッシュリスト',
                              description: `${product.name}をウィッシュリストに追加しました`,
                            });
                          }}
                          className={viewMode === 'list' ? 'w-full' : ''}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
