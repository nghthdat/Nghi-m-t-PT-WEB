import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from './../context/AuthContext';
import { OrderCustomerInfo, Order } from '../types';
import { formatVND } from '../lib/formatCurrency';
import {
  X, CheckCircle2, ShieldCheck, Truck, CreditCard,
  Banknote, QrCode, Smartphone, ArrowLeft, Copy, Check,
  Loader2, AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  onNavigateToShop?: () => void;
}

// Vietnamese mobile numbers: 10 digits starting with a valid carrier prefix
// (03/05/07/08/09), optionally written with the +84 country code instead of
// the leading 0.
const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

function isValidVietnamesePhone(phone: string): boolean {
  return VN_PHONE_REGEX.test(phone.trim().replace(/[\s.-]/g, ''));
}

interface FormFieldErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onNavigateToShop }) => {
  const { 
    cart, 
    subtotal, 
    shippingFee, 
    discountAmount, 
    finalTotal, 
    appliedCoupon,
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    placeOrder 
  } = useCart();
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<OrderCustomerInfo>({
    fullName: profile?.display_name || user?.displayName || '',
    phone: profile?.phone || '',
    email: profile?.email || user?.email || '',
    address: profile?.address || '',
    city: profile?.city || 'Hà Nội',
    note: ''
  });

  // Update formData when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.display_name || user?.displayName || '',
        phone: prev.phone || profile.phone || '',
        email: prev.email || profile.email || user?.email || '',
        address: prev.address || profile.address || '',
        city: prev.city || profile.city || 'Hà Nội'
      }));
    }
  }, [profile, user]);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr' | 'momo' | ''>('');
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
    if (fieldErrors[name as keyof FormFieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên người nhận.';
    }

    const phone = formData.phone.trim();
    if (!phone) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!isValidVietnamesePhone(phone)) {
      errors.phone = 'Vui lòng nhập số điện thoại hợp lệ (10 số, đầu số 03/05/07/08/09).';
    }

    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ giao hàng không được để trống.';
    }

    return errors;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard against a double-submit from a rapid double click racing the
    // `disabled` attribute update.
    if (isSubmitting) return;

    setValidationError('');
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!paymentMethod) {
      setPaymentError('Vui lòng chọn một phương thức thanh toán trước khi tiếp tục.');
      return;
    }
    setPaymentError('');

    setIsSubmitting(true);
    try {
      const order = await placeOrder(formData, paymentMethod);
      setCompletedOrder(order);
    } catch (err) {
      console.error('Order placement failed:', err);
      setValidationError('Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng kiểm tra lại thông tin và thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPayment = (method: 'cod' | 'vietqr' | 'momo') => {
    setPaymentMethod(method);
    if (paymentError) setPaymentError('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2000);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setFieldErrors({});
    setValidationError('');
    setPaymentError('');
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        id="checkout-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#EAE0D5] shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
      >
        {/* Modal Close Button */}
        <button
          id="btn-close-checkout"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] flex items-center justify-center border border-[#EAE0D5] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {completedOrder ? (
          /* ================= ORDER SUCCESS SCREEN ================= */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Đặt hàng thành công
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#2B2118] mt-2">
                Cảm ơn bạn đã tin tưởng Ăn Gì Hôm Nay!
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5D4F] mt-1 max-w-md mx-auto">
                Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị đóng gói để gửi tới bạn.
              </p>
            </div>

            {/* Order Card Info */}
            <div className="bg-[#FFF8F0] p-4 sm:p-5 rounded-2xl border border-[#FFE0CC] text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE0D5] text-xs">
                <span className="text-[#8C7D6F]">Mã đơn hàng:</span>
                <span className="font-mono font-black text-[#a33e07] text-sm">{completedOrder.orderNumber}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D6F]">Người nhận:</span>
                <span className="font-semibold text-[#2B2118]">{completedOrder.customerInfo.fullName} ({completedOrder.customerInfo.phone})</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D6F]">Địa chỉ nhận hàng:</span>
                <span className="font-semibold text-[#2B2118] text-right max-w-[260px] truncate">
                  {completedOrder.customerInfo.address}, {completedOrder.customerInfo.city}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8C7D6F]">Phương thức thanh toán:</span>
                <span className="font-bold text-[#2B2118] uppercase">
                  {completedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : completedOrder.paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Ví MoMo'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EAE0D5] text-sm font-black text-[#2B2118]">
                <span>Tổng giá trị đơn:</span>
                <span className="text-[#a33e07] text-base">{formatVND(completedOrder.total)}</span>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE0D5] text-left space-y-2">
              <h4 className="text-xs font-bold text-[#2B2118]">
                Tóm tắt sản phẩm đã mua ({completedOrder.items.length} món):
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {completedOrder.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-2.5 text-xs py-1 border-b border-[#F7F2EE] last:border-b-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover bg-[#FAF5F0] border border-[#EAE0D5] shrink-0"
                    />
                    <span className="flex-1 min-w-0 truncate text-[#524436]">
                      {item.quantity}x {item.productName} {item.selectedOption ? `(${item.selectedOption})` : ''}
                    </span>
                    <span className="font-bold text-[#2B2118] shrink-0">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Payment Box if chosen VietQR or MoMo */}
            {completedOrder.paymentMethod === 'vietqr' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#a33e07]" />
                  <h4 className="text-xs font-bold text-[#2B2118]">Thông tin chuyển khoản VietQR:</h4>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8C7D6F]">Ngân hàng:</span>
                    <span className="font-bold text-[#2B2118]">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8C7D6F]">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#a33e07]">0988776655</span>
                      <button
                        onClick={() => handleCopy('0988776655')}
                        className="text-[10px] text-[#8C7D6F] hover:text-[#a33e07] p-1"
                        title="Sao chép STK"
                      >
                        {copiedBankInfo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7D6F]">Chủ tài khoản:</span>
                    <span className="font-bold text-[#2B2118]">AN GI HOM NAY STORE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7D6F]">Số tiền:</span>
                    <span className="font-bold text-[#a33e07]">{formatVND(completedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7D6F]">Nội dung:</span>
                    <span className="font-bold text-blue-700">{completedOrder.orderNumber}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B5D4F] leading-tight">
                  * Vui lòng ghi đúng nội dung chuyển khoản là <strong>{completedOrder.orderNumber}</strong> để hệ thống tự động xác nhận đơn trong 1-3 phút.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={handleClose}
                className="py-3 px-6 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 transition-all active:scale-95"
              >
                Tiếp tục xem công thức & mua sắm
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHECKOUT FORM SCREEN ================= */
          <form onSubmit={handleSubmitOrder} className="p-5 sm:p-7 space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2B2118]">
                Xác nhận đặt hàng & Thanh toán
              </h2>
              <p className="text-xs text-[#6B5D4F] mt-0.5">
                Vui lòng cung cấp địa chỉ nhận hàng và chọn phương thức thanh toán phù hợp
              </p>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {validationError}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a33e07] flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                1. Thông tin giao hàng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2118] mb-1">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="VD: Nguyễn Văn A"
                    aria-invalid={!!fieldErrors.fullName}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden bg-[#FAF5F0] ${
                      fieldErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-[#EAE0D5] focus:border-[#a33e07]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2118] mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="VD: 0912345678"
                    aria-invalid={!!fieldErrors.phone}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden bg-[#FAF5F0] ${
                      fieldErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-[#EAE0D5] focus:border-[#a33e07]'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2B2118] mb-1">
                    Địa chỉ chi tiết (Số nhà, Tên đường, Phường/Xã) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: 123 Phố Tràng Tiền, Hoàn Kiếm"
                    aria-invalid={!!fieldErrors.address}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden bg-[#FAF5F0] ${
                      fieldErrors.address ? 'border-red-400 focus:border-red-500' : 'border-[#EAE0D5] focus:border-[#a33e07]'
                    }`}
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2118] mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE0D5] text-xs focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Nghệ An">Nghệ An</option>
                    <option value="Huế">Thừa Thiên Huế</option>
                    <option value="Khác">Tỉnh thành khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2118] mb-1">
                  Ghi chú cho shipper (Không bắt buộc)
                </label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EAE0D5] text-xs focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-[#F7F2EE]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a33e07] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                2. Phương thức thanh toán
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label
                  onClick={() => handleSelectPayment('cod')}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#a33e07] bg-[#FFF0E6] ring-1 ring-[#a33e07]'
                      : 'border-[#EAE0D5] bg-white hover:border-[#D1C2B4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-[#a33e07]' : 'text-[#8C7D6F]'}`} />
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => handleSelectPayment('cod')}
                      className="accent-[#a33e07]"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B2118] block">Thanh toán COD</span>
                    <span className="text-[10px] text-[#6B5D4F]">Nhận hàng rồi trả tiền mặt</span>
                  </div>
                </label>

                <label
                  onClick={() => handleSelectPayment('vietqr')}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'vietqr'
                      ? 'border-[#a33e07] bg-[#FFF0E6] ring-1 ring-[#a33e07]'
                      : 'border-[#EAE0D5] bg-white hover:border-[#D1C2B4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <QrCode className={`w-5 h-5 ${paymentMethod === 'vietqr' ? 'text-[#a33e07]' : 'text-[#8C7D6F]'}`} />
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'vietqr'}
                      onChange={() => handleSelectPayment('vietqr')}
                      className="accent-[#a33e07]"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B2118] block">Chuyển khoản VietQR</span>
                    <span className="text-[10px] text-[#6B5D4F]">Quét QR ngân hàng tức thì</span>
                  </div>
                </label>

                <label
                  onClick={() => handleSelectPayment('momo')}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-[#a33e07] bg-[#FFF0E6] ring-1 ring-[#a33e07]'
                      : 'border-[#EAE0D5] bg-white hover:border-[#D1C2B4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'momo' ? 'text-[#a33e07]' : 'text-[#8C7D6F]'}`} />
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'momo'}
                      onChange={() => handleSelectPayment('momo')}
                      className="accent-[#a33e07]"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B2118] block">Ví điện tử MoMo</span>
                    <span className="text-[10px] text-[#6B5D4F]">Thanh toán qua app MoMo</span>
                  </div>
                </label>
              </div>

              {paymentError && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {paymentError}
                </p>
              )}
            </div>

            {/* Order Items Preview */}
            <div className="pt-3 border-t border-[#F7F2EE] space-y-2">
              <h4 className="text-xs font-bold text-[#2B2118]">Tóm tắt đơn hàng ({cart.length} món):</h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.selectedOption}`} className="flex justify-between items-center text-xs py-1">
                    <span className="text-[#524436] truncate max-w-[280px]">
                      {item.quantity}x {item.product.name} {item.selectedOption ? `(${item.selectedOption})` : ''}
                    </span>
                    <span className="font-bold text-[#2B2118] shrink-0">
                      {formatVND(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price summary */}
            <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#FFE0CC] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B5D4F]">
                <span>Tạm tính:</span>
                <span className="font-semibold text-[#2B2118]">{formatVND(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Mã giảm giá ({appliedCoupon?.code}):</span>
                  <span className="font-bold">-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B5D4F]">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-[#2B2118]">
                  {shippingFee === 0 ? <span className="text-emerald-700 font-bold">Miễn phí</span> : formatVND(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#EAE0D5] text-sm font-black text-[#2B2118]">
                <span>Tổng thanh toán:</span>
                <span className="text-lg text-[#a33e07]">{formatVND(finalTotal)}</span>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-xl border border-[#EAE0D5] text-xs font-semibold text-[#6B5D4F] hover:bg-[#FAF5F0] transition-colors"
              >
                Quay lại
              </button>
              <button
                id="btn-confirm-order"
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#a33e07]/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  <span>Hoàn tất đặt hàng ({formatVND(finalTotal)})</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
