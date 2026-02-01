// 格式化工具函数

/**
 * 格式化金额为货币格式
 * @param {number} amount - 金额
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的金额字符串
 */
export function formatCurrency(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '¥0.00'
  }

  const fixed = Number(amount).toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return '¥' + parts.join('.')
}

/**
 * 格式化百分比
 * @param {number} value - 数值（0-1之间）
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 格式化数字（添加千分位）
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认0位
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }

  const fixed = Number(num).toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

/**
 * 解析货币字符串为数字
 * @param {string} str - 货币字符串
 * @returns {number} 数字
 */
export function parseCurrency(str) {
  if (!str) return 0

  const cleaned = str.replace(/[¥,]/g, '')
  const num = parseFloat(cleaned)

  return isNaN(num) ? 0 : num
}

/**
 * 精确到分（0.01元）
 * @param {number} amount - 金额
 * @returns {number} 精确到分的金额
 */
export function toFen(amount) {
  return Math.round(amount * 100) / 100
}

/**
 * 精确到元（整数）
 * @param {number} amount - 金额
 * @returns {number} 精确到元的金额
 */
export function toYuan(amount) {
  return Math.round(amount)
}
