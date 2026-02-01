// 年终奖税计算

import { BONUS_TAX_TABLE } from './taxTables.js'
import { calculateTaxByTable } from './monthlySalary.js'

/**
 * 计算年终奖个人所得税（单独计税）
 * @param {number} bonus - 年终奖金额
 * @returns {object} 年终奖税务明细
 */
export function calculateYearEndBonusTax(bonus) {
  if (bonus <= 0) {
    return {
      grossBonus: 0,
      tax: 0,
      afterTaxBonus: 0
    }
  }

  // 使用年终奖专用税率表计算
  const tax = calculateTaxByTable(bonus, BONUS_TAX_TABLE)

  // 税后年终奖
  const afterTaxBonus = Math.round((bonus - tax) * 100) / 100

  return {
    grossBonus: bonus,
    tax,
    afterTaxBonus
  }
}

/**
 * 计算年终奖转换方案
 * @param {number} originalBonus - 原始年终奖
 * @param {number} toSalary - 转为月工资的金额
 * @param {number} toOption - 转为期权的金额
 * @returns {object} 转换后的年终奖明细
 */
export function calculateBonusConversion(originalBonus, toSalary = 0, toOption = 0) {
  const remainingBonus = originalBonus - toSalary - toOption

  if (remainingBonus < 0) {
    throw new Error('转换金额超过年终奖总额')
  }

  return {
    originalBonus,
    toSalary,
    toOption,
    remainingBonus,
    bonusTax: calculateYearEndBonusTax(remainingBonus)
  }
}
