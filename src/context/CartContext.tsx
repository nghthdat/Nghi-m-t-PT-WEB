import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem, CouponDiscount, OrderCustomerInfo, Order } from '../types';
import { POPULAR_COUPONS, INITIAL_PRODUCTS } from '../data/seedProducts';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon: CouponDiscount | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  selectedProductQuickView: ProductItem | null;
  orders: Order[];
  
  // Actions
  addToCart: (product: ProductItem, quantity?: number, option?: string, openCartDrawer?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, option?: string) => void;
  removeFromCart: (productId: string, option?: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setSelectedProductQuickView: (product: ProductItem | null) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (customerInfo: OrderCustomerInfo, paymentMethod: 'cod' | 'vietqr' | 'momo') => Promise<Order>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'an_gi_hom_nay_cart_v1';
const ORDERS_STORAGE_KEY = 'an_gi_hom_nay_orders_v1';
const FREE_SHIPPING_THRESHOLD = 300000;
const DEFAULT_SHIPPING_FEE = 25000;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, showToast } = useAuth();

  // Load initial cart from local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load order history
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedProductQuickView, setSelectedProductQuickView] = useState<ProductItem | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Calculations
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percentage') {
        const calculated = (subtotal * appliedCoupon.discountValue) / 100;
        discountAmount = appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
      } else if (appliedCoupon.discountType === 'fixed') {
        discountAmount = appliedCoupon.discountValue;
      }
    }
  }

  // Calculate Shipping fee
  let shippingFee = subtotal === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE);
  if (appliedCoupon?.code === 'FREESHIP' && subtotal >= appliedCoupon.minOrderValue) {
    shippingFee = 0;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Add to cart
  const addToCart = (
    product: ProductItem, 
    quantity: number = 1, 
    option?: string, 
    openCartDrawer: boolean = false
  ) => {
    const selectedOpt = option || (product.options && product.options.length > 0 ? product.options[0] : undefined);
    
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.selectedOption === selectedOpt
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(newQty, product.stockCount || 99)
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            quantity: Math.min(quantity, product.stockCount || 99),
            selectedOption: selectedOpt
          }
        ];
      }
    });

    showToast(`Đã thêm "${product.name.slice(0, 30)}..." vào giỏ hàng!`, 'success');

    if (openCartDrawer) {
      setIsCartOpen(true);
    }
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number, option?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, option);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId && item.selectedOption === option) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stockCount || 99)
          };
        }
        return item;
      })
    );
  };

  // Remove item
  const removeFromCart = (productId: string, option?: string) => {
    setCart(prev =>
      prev.filter(item => !(item.productId === productId && item.selectedOption === option))
    );
    showToast('Đã xoá sản phẩm khỏi giỏ hàng', 'info');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Apply voucher
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmedCode = code.trim().toUpperCase();
    const found = POPULAR_COUPONS.find(c => c.code === trimmedCode);

    if (!found) {
      return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    }

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Mã ${found.code} chỉ áp dụng cho đơn từ ${found.minOrderValue.toLocaleString('vi-VN')}đ.`
      };
    }

    setAppliedCoupon(found);
    showToast(`Áp dụng mã giảm giá ${found.code} thành công!`, 'success');
    return { success: true, message: `Đã áp dụng mã ${found.code}!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Đã gỡ mã giảm giá.', 'info');
  };

  // Place Order
  const placeOrder = async (
    customerInfo: OrderCustomerInfo,
    paymentMethod: 'cod' | 'vietqr' | 'momo'
  ): Promise<Order> => {
    const orderNum = 'AGHN-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber: orderNum,
      userId: user?.uid,
      customerInfo,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        selectedOption: item.selectedOption
      })),
      subtotal,
      discountAmount,
      appliedCoupon: appliedCoupon?.code,
      shippingFee,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save order locally and inform user
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    showToast(`Đặt hàng thành công! Mã đơn: ${orderNum}`, 'success');
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        subtotal,
        shippingFee,
        discountAmount,
        finalTotal,
        appliedCoupon,
        isCartOpen,
        isCheckoutOpen,
        selectedProductQuickView,
        orders,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setIsCartOpen,
        setIsCheckoutOpen,
        setSelectedProductQuickView,
        applyCoupon,
        removeCoupon,
        placeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
