// 月工资税计算

import { MONTHLY_TAX_TABLE, TAX_THRESHOLD } from './taxTables.js'

/**
 * 根据税率表计算税额
 * @param {number} income - 应纳税所得额
 * @param {Array} taxTable - 税率表
 * @returns {number} 税额（精确到0.01元）
 */
export function calculateTaxByTable(income, taxTable) {
  if (income <= 0) return 0

  for (const bracket of taxTable) {
    if (income <= bracket.limit) {
      const tax = income * bracket.rate - bracket.quickDeduction
      return Math.max(0, Math.round(tax * 100) / 100)
    }
  }

  return 0
}

/**
 * 计算月工资个人所得税
 * @param {number} monthlySalary - 月工资
 * @param {number} socialInsurance - 社保扣除
 * @param {number} housingFund - 公积金扣除
 * @param {number} specialDeduction - 专项附加扣除
 * @returns {object} 月工资税务明细
 */
export function calculateMonthlySalaryTax(monthlySalary, socialInsurance, housingFund, specialDeduction = 0) {
  // 月度应纳税所得额 = 月工资 - 起征点 - 社保 - 公积金 - 专项附加扣除
  const monthlyTaxableIncome = monthlySalary - TAX_THRESHOLD - socialInsurance - housingFund - specialDeduction

  // 年度应纳税所得额
  const annualTaxableIncome = Math.max(0, monthlyTaxableIncome * 12)

  // 计算年度个税
  const annualTax = calculateTaxByTable(annualTaxableIncome, MONTHLY_TAX_TABLE)

  // 月均个税
  const monthlyTax = Math.round(annualTax / 12 * 100) / 100

  // 税后月工资
  const afterTaxSalary = Math.round((monthlySalary - socialInsurance - housingFund - monthlyTax) * 100) / 100

  // 含公积金月收入（双边24%）
  const withHousingFund = Math.round((afterTaxSalary + housingFund * 2) * 100) / 100

  return {
    grossSalary: monthlySalary,
    socialInsurance,
    housingFund,
    specialDeduction,
    taxableIncome: Math.max(0, monthlyTaxableIncome),
    annualTaxableIncome,
    annualTax,
    monthlyTax,
    afterTaxSalary,
    withHousingFund
  }
}
