// Standard Vietnamese currency display used across the shop/cart:
// dot thousand-separators with a trailing " đ" (e.g. "150.000 đ").
export function formatVND(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${rounded.toLocaleString('vi-VN')} đ`;
}
