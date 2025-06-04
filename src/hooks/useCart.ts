import { useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, Product } from '@/types/ecommerce';
import { useToast } from '@/components/ui/use-toast';

interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  addToCart: (
    product: Product,
    quantity?: number,
    attributes?: Record<string, string>
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // カートの初期化
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      // ローカルストレージからカートを読み込み
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } else {
        // 新しいカートを作成
        const newCart: Cart = {
          id: Date.now().toString(),
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          currency: 'JPY',
          updatedAt: new Date(),
        };
        setCart(newCart);
      }
    } catch (error) {
      console.error('カートの読み込みエラー:', error);
      toast({
        title: 'エラー',
        description: 'カートの読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveCart = useCallback((updatedCart: Cart) => {
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  }, []);

  const calculateTotals = useCallback(
    (items: CartItem[]): Omit<Cart, 'id' | 'userId' | 'items' | 'currency' | 'updatedAt'> => {
      const subtotal = items.reduce(
        (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
        0
      );
      const tax = subtotal * 0.1; // 10%の税率
      const shipping = subtotal >= 5000 ? 0 : 500; // 5000円以上で送料無料
      const discount = 0; // クーポン機能は後で実装
      const total = subtotal + tax + shipping - discount;

      return { subtotal, tax, shipping, discount, total };
    },
    []
  );

  const addToCart = useCallback(
    async (product: Product, quantity: number = 1, attributes?: Record<string, string>) => {
      if (!cart) return;

      try {
        setLoading(true);

        // 在庫チェック
        if (product.stock < quantity) {
          toast({
            title: '在庫不足',
            description: `${product.name}の在庫が不足しています（在庫: ${product.stock}個）`,
            variant: 'destructive',
          });
          return;
        }

        const existingItemIndex = cart.items.findIndex(
          (item) =>
            item.productId === product.id &&
            JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // 既存のアイテムの数量を更新
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;
          if (newQuantity > product.stock) {
            toast({
              title: '在庫不足',
              description: `${product.name}の在庫が不足しています（在庫: ${product.stock}個）`,
              variant: 'destructive',
            });
            return;
          }

          updatedItems = [...cart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
          };
        } else {
          // 新しいアイテムを追加
          const newItem: CartItem = {
            id: Date.now().toString(),
            productId: product.id,
            product,
            quantity,
            selectedAttributes: attributes,
            addedAt: new Date(),
          };
          updatedItems = [...cart.items, newItem];
        }

        const totals = calculateTotals(updatedItems);
        const updatedCart: Cart = {
          ...cart,
          items: updatedItems,
          ...totals,
          updatedAt: new Date(),
        };

        saveCart(updatedCart);

        toast({
          title: 'カートに追加',
          description: `${product.name}をカートに追加しました`,
        });
      } catch (error) {
        console.error('カート追加エラー:', error);
        toast({
          title: 'エラー',
          description: 'カートへの追加に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [cart, calculateTotals, saveCart, toast]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!cart) return;

      try {
        setLoading(true);
        const updatedItems = cart.items.filter((item) => item.id !== itemId);
        const totals = calculateTotals(updatedItems);

        const updatedCart: Cart = {
          ...cart,
          items: updatedItems,
          ...totals,
          updatedAt: new Date(),
        };

        saveCart(updatedCart);

        toast({
          title: 'アイテム削除',
          description: 'カートからアイテムを削除しました',
        });
      } catch (error) {
        console.error('カート削除エラー:', error);
        toast({
          title: 'エラー',
          description: 'アイテムの削除に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [cart, calculateTotals, saveCart, toast]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart || quantity < 1) return;

      try {
        setLoading(true);
        const itemIndex = cart.items.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) return;

        const item = cart.items[itemIndex];

        // 在庫チェック
        if (quantity > item.product.stock) {
          toast({
            title: '在庫不足',
            description: `${item.product.name}の在庫が不足しています（在庫: ${item.product.stock}個）`,
            variant: 'destructive',
          });
          return;
        }

        const updatedItems = [...cart.items];
        updatedItems[itemIndex] = { ...item, quantity };

        const totals = calculateTotals(updatedItems);
        const updatedCart: Cart = {
          ...cart,
          items: updatedItems,
          ...totals,
          updatedAt: new Date(),
        };

        saveCart(updatedCart);
      } catch (error) {
        console.error('数量更新エラー:', error);
        toast({
          title: 'エラー',
          description: '数量の更新に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [cart, calculateTotals, saveCart, toast]
  );

  const clearCart = useCallback(async () => {
    if (!cart) return;

    try {
      setLoading(true);
      const clearedCart: Cart = {
        ...cart,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        updatedAt: new Date(),
      };

      saveCart(clearedCart);

      toast({
        title: 'カートをクリア',
        description: 'カートを空にしました',
      });
    } catch (error) {
      console.error('カートクリアエラー:', error);
      toast({
        title: 'エラー',
        description: 'カートのクリアに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [cart, saveCart, toast]);

  const getCartTotal = useCallback(() => {
    return cart?.total || 0;
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
  }, [cart]);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };
};
