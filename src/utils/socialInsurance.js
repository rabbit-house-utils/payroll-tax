// 社保和公积金计算

import {
  TOTAL_SOCIAL_INSURANCE_RATE,
  HOUSING_FUND_RATE,
  HOUSING_FUND_TOTAL_RATE,
  BASE_SALARY_MIN_RATIO,
  BASE_SALARY_MAX_RATIO,
  DEFAULT_SOCIAL_WAGE
} from './taxTables.js'

/**
 * 计算缴费基数
 * @param {number} monthlySalary - 月工资
 * @param {number} yearEndBonus - 年终奖
 * @param {number} socialWage - 社平工资
 * @returns {number} 缴费基数
 */
export function calculateContributionBase(monthlySalary, yearEndBonus, socialWage = DEFAULT_SOCIAL_WAGE) {
  // 年收入 = 月工资 × 12 + 年终奖
  const annualIncome = monthlySalary * 12 + yearEndBonus

  // 月均收入 = 年收入 / 12
  const monthlyAverage = annualIncome / 12

  // 缴费基数限制在社平工资的60%-300%之间
  const minBase = socialWage * BASE_SALARY_MIN_RATIO
  const maxBase = socialWage * BASE_SALARY_MAX_RATIO

  return Math.min(Math.max(monthlyAverage, minBase), maxBase)
}

/**
 * 计算社保缴费
 * @param {number} contributionBase - 缴费基数
 * @returns {object} 社保缴费明细
 */
export function calculateSocialInsurance(contributionBase) {
  const pension = contributionBase * 0.08    // 养老保险 8%
  const medical = contributionBase * 0.02    // 医疗保险 2%
  const unemployment = contributionBase * 0.005 // 失业保险 0.5%
  const total = contributionBase * TOTAL_SOCIAL_INSURANCE_RATE // 总计 10.5%

  return {
    pension: Math.round(pension * 100) / 100,
    medical: Math.round(medical * 100) / 100,
    unemployment: Math.round(unemployment * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

/**
 * 计算公积金缴费
 * @param {number} contributionBase - 缴费基数
 * @returns {object} 公积金缴费明细
 */
export function calculateHousingFund(contributionBase) {
  // 个人缴纳需要取整（元）
  const personal = Math.round(contributionBase * HOUSING_FUND_RATE)
  const total = personal * 2 // 双边

  return {
    personal,
    total
  }
}

/**
 * 计算五险一金总额
 * @param {number} monthlySalary - 月工资
 * @param {number} yearEndBonus - 年终奖
 * @param {number} socialWage - 社平工资
 * @returns {object} 五险一金明细
 */
export function calculateInsuranceAndFund(monthlySalary, yearEndBonus, socialWage = DEFAULT_SOCIAL_WAGE) {
  const contributionBase = calculateContributionBase(monthlySalary, yearEndBonus, socialWage)
  const socialInsurance = calculateSocialInsurance(contributionBase)
  const housingFund = calculateHousingFund(contributionBase)

  return {
    contributionBase,
    socialInsurance,
    housingFund,
    monthlyTotal: socialInsurance.total + housingFund.personal
  }
}
