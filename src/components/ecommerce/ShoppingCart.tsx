import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingCart as ShoppingCartIcon,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface ShoppingCartProps {
  trigger?: React.ReactNode;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ trigger }) => {
  const { cart, loading, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } =
    useCart();
  const navigate = useNavigate();

  // 価格フォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // チェックアウトページへ移動
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // 数量変更ハンドラー
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative">
            <ShoppingCartIcon className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            ショッピングカート
          </SheetTitle>
          <SheetDescription>
            {cartItemCount > 0 ? `${cartItemCount}点のアイテム` : 'カートは空です'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">カートは空です</h3>
              <p className="text-gray-600 mb-4">商品を追加してショッピングを始めましょう</p>
              <Button onClick={() => navigate('/products')}>商品を見る</Button>
            </div>
          ) : (
            <>
              {/* カートアイテム一覧 */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* 商品画像 */}
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* 商品詳細 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>

                        {/* 価格 */}
                        <div className="flex items-center gap-2 mb-2">
                          {item.product.salePrice ? (
                            <>
                              <span className="text-sm font-medium text-red-600">
                                {formatPrice(item.product.salePrice)}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(item.product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>

                        {/* 選択した属性 */}
                        {item.selectedAttributes &&
                          Object.keys(item.selectedAttributes).length > 0 && (
                            <div className="text-xs text-gray-500 mb-2">
                              {Object.entries(item.selectedAttributes).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* 数量コントロール */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={loading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={loading || item.quantity >= item.product.stock}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* 在庫警告 */}
                        {item.product.stock < 10 && (
                          <div className="text-xs text-orange-600 mt-1">
                            残り{item.product.stock}個
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* 合計金額 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>小計:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>消費税:</span>
                  <span>{formatPrice(cart.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>配送料:</span>
                  <span>{cart.shipping === 0 ? '無料' : formatPrice(cart.shipping)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>割引:</span>
                    <span>-{formatPrice(cart.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>合計:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* 配送情報 */}
              {cart.shipping === 0 && cart.subtotal >= 5000 && (
                <div className="text-sm text-green-600 text-center">✓ 送料無料でお届けします</div>
              )}

              {cart.subtotal < 5000 && (
                <div className="text-sm text-center">
                  <span className="text-gray-600">あと</span>
                  <span className="font-medium text-blue-600">
                    {formatPrice(5000 - cart.subtotal)}
                  </span>
                  <span className="text-gray-600">で送料無料</span>
                </div>
              )}

              {/* チェックアウトボタン */}
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full" size="lg" disabled={loading}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  レジに進む
                </Button>
                <Button variant="outline" onClick={() => navigate('/products')} className="w-full">
                  買い物を続ける
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
