/**
 * 金额工具：系统内所有金额均以「分」为单位的整数传输与存储，禁止浮点运算
 */

/** 分 → 展示用字符串，如 12800 → "128.00" */
export function formatPrice(cents: number): string {
  const safe = Math.round(Number.isFinite(cents) ? cents : 0)
  const negative = safe < 0
  const abs = Math.abs(safe)
  const yuan = Math.floor(abs / 100)
  const fen = abs % 100
  return `${negative ? '-' : ''}${yuan}.${String(fen).padStart(2, '0')}`
}

/** 分 → 带符号的展示字符串，如 12800 → "¥128.00" */
export function formatPriceWithSymbol(cents: number): string {
  return `¥${formatPrice(cents)}`
}
