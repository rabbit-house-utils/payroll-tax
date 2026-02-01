// 优化引擎 - 找到最优收入分配方案

import { calculateInsuranceAndFund } from './socialInsurance.js'
import { calculateMonthlySalaryTax } from './monthlySalary.js'
import { calculateYearEndBonusTax, calculateBonusConversion } from './yearEndBonus.js'
import {
  calculateOptionTax,
  calculateStockTax,
  calculateBonusToOption,
  calculateTotalOptionValue,
  calculateVestingDistribution,
  calculateListedEquityIncome
} from './stockOptions.js'

/**
 * 计算单个方案的完整税务情况
 * @param {object} params - 参数
 * @returns {object} 完整的税务计算结果
 */
export function calculateScenario(params) {
  const {
    monthlySalary,
    yearEndBonus,
    socialWage,
    specialDeduction,
    bonusToSalary = 0,
    bonusToOption = 0,
    optionConversionRatio = 0.75,
    hasListedEquity = false,
    listedEquityShares = 0,
    listedEquityVestPrice = 0,
    listedEquityStrikePrice = 0,
    hasUnlistedOptions = false,
    optionGrants = [],
    currentStockPrice = 0,
    exchangeRate = 7.2
  } = params

  // 计算实际月工资（包含从年终奖转来的部分，分摊到12个月）
  const actualMonthlySalary = monthlySalary + bonusToSalary / 12

  // 计算实际年终奖（扣除转出的部分）
  const actualYearEndBonus = yearEndBonus - bonusToSalary - bonusToOption

  // 计算五险一金（基于原始收入）
  const insurance = calculateInsuranceAndFund(monthlySalary, yearEndBonus, socialWage)

  // 计算月工资税
  const salaryTax = calculateMonthlySalaryTax(
    actualMonthlySalary,
    insurance.socialInsurance.total,
    insurance.housingFund.personal,
    specialDeduction
  )

  // 计算年终奖税
  const bonusTax = calculateYearEndBonusTax(actualYearEndBonus)

  // 计算期权/股票
  let equityTax
  let totalEquityAmount = 0
  let yearlyEquityIncome = 0

  // 已上市公司股票/期权
  if (hasListedEquity) {
    const listedEquityIncome = calculateListedEquityIncome(
      listedEquityShares,
      listedEquityVestPrice,
      listedEquityStrikePrice,
      exchangeRate
    )
    totalEquityAmount += listedEquityIncome
    yearlyEquityIncome += listedEquityIncome
  }

  // 未上市公司期权
  if (hasUnlistedOptions && optionGrants && optionGrants.length > 0) {
    const unlistedOptionValue = calculateTotalOptionValue(optionGrants, currentStockPrice, exchangeRate)
    totalEquityAmount += unlistedOptionValue

    // 计算当年归属的期权价值
    const vestingDistribution = calculateVestingDistribution(optionGrants, currentStockPrice, exchangeRate)
    yearlyEquityIncome += vestingDistribution[1] || 0 // 取第1年的归属金额
  }

  // 年终奖转期权（只有未上市公司期权才能转换）
  // 转换比例表示折扣率，如75%表示用75元年终奖可换购100元期权
  // 公式: 期权价值 = 年终奖金额 / 转换比例
  let convertedOptionAmount = 0
  if (bonusToOption > 0 && hasUnlistedOptions) {
    convertedOptionAmount = bonusToOption / optionConversionRatio
    totalEquityAmount += convertedOptionAmount
    yearlyEquityIncome += convertedOptionAmount
  }

  // 计算股权税
  if (hasListedEquity && !hasUnlistedOptions) {
    // 只有已上市股票/期权，按股票税计算（一次性）
    equityTax = calculateStockTax(totalEquityAmount)
  } else if (hasUnlistedOptions) {
    // 有未上市期权，按期权税计算（多年分摊，使用边际税率方法）
    equityTax = calculateOptionTax(totalEquityAmount, optionGrants, currentStockPrice, exchangeRate, convertedOptionAmount)
  } else {
    equityTax = {
      totalAmount: 0,
      totalTax: 0,
      afterTaxAmount: 0
    }
  }

  // 计算总收入和总税额（使用当年归属的期权价值）
  const totalGrossIncome = actualMonthlySalary * 12 + actualYearEndBonus + yearlyEquityIncome

  // 期权税使用每年分摊的税款，股票税使用总税款
  const equityYearlyTax = hasUnlistedOptions
    ? (equityTax.yearlyTax || 0)
    : (equityTax.tax || 0)

  const totalTax = salaryTax.annualTax + bonusTax.tax + equityYearlyTax
  const totalInsurance = insurance.monthlyTotal * 12

  // 可支配收入（不含公积金）
  const disposableIncome = Math.round((totalGrossIncome - totalTax - totalInsurance) * 100) / 100

  // 含公积金收入（双边24%）
  const withHousingFund = Math.round((disposableIncome + insurance.housingFund.personal * 12 * 2) * 100) / 100

  return {
    // 输入参数
    monthlySalary: actualMonthlySalary,
    yearEndBonus: actualYearEndBonus,
    equityAmount: yearlyEquityIncome, // 改为当年归属的期权价值
    totalEquityAmount, // 添加总期权价值字段（用于税务计算）
    bonusToSalary,
    bonusToOption,

    // 五险一金
    insurance,

    // 税务明细
    salaryTax,
    bonusTax,
    equityTax,

    // 汇总
    totalGrossIncome,
    totalTax,
    totalInsurance,
    disposableIncome,
    withHousingFund
  }
}

/**
 * 优化单个转换维度（年终奖转月工资或转期权）
 * @param {object} baseParams - 基础参数
 * @param {string} conversionType - 转换类型 'toSalary' 或 'toOption'
 * @param {number} maxAmount - 最大转换金额
 * @returns {object} 最优结果
 */
function optimizeSingleConversion(baseParams, conversionType, maxAmount) {
  let bestResult = null
  let maxDisposable = -Infinity

  // 粗搜索：1000元步长
  for (let amount = 0; amount <= maxAmount; amount += 1000) {
    const params = { ...baseParams }
    if (conversionType === 'toSalary') {
      params.bonusToSalary = amount
    } else {
      params.bonusToOption = amount
    }

    const result = calculateScenario(params)

    if (result.disposableIncome > maxDisposable) {
      maxDisposable = result.disposableIncome
      bestResult = { ...result, searchAmount: amount }
    }
  }

  if (!bestResult) {
    return calculateScenario(baseParams)
  }

  // 细搜索：在最优解附近以1元步长搜索
  const searchStart = Math.max(0, bestResult.searchAmount - 1000)
  const searchEnd = Math.min(maxAmount, bestResult.searchAmount + 1000)

  for (let amount = searchStart; amount <= searchEnd; amount++) {
    const params = { ...baseParams }
    if (conversionType === 'toSalary') {
      params.bonusToSalary = amount
    } else {
      params.bonusToOption = amount
    }

    const result = calculateScenario(params)

    if (result.disposableIncome > maxDisposable) {
      maxDisposable = result.disposableIncome
      bestResult = result
    }
  }

  return bestResult
}

/**
 * 生成三种方案对比
 * @param {object} params - 基础参数
 * @returns {object} 三种方案的计算结果
 */
export function generateScenarios(params) {
  const {
    monthlySalary,
    yearEndBonus,
    allowSalaryConversion,
    allowOptionConversion
  } = params

  // 方案1：基础方案（不转换）
  const scenario1 = calculateScenario({
    ...params,
    bonusToSalary: 0,
    bonusToOption: 0
  })

  // 方案2：年终奖转月工资
  let scenario2
  if (allowSalaryConversion && yearEndBonus > 0) {
    scenario2 = optimizeSingleConversion(
      { ...params, bonusToOption: 0 },
      'toSalary',
      yearEndBonus
    )
  } else {
    scenario2 = scenario1
  }

  // 方案3：年终奖转期权
  let scenario3
  if (allowOptionConversion && yearEndBonus > 0) {
    scenario3 = optimizeSingleConversion(
      { ...params, bonusToSalary: 0 },
      'toOption',
      yearEndBonus
    )
  } else {
    scenario3 = scenario1
  }

  return {
    scenario1,
    scenario2,
    scenario3
  }
}

/**
 * 找出最优方案
 * @param {object} scenarios - 三种方案
 * @returns {object} 最优方案信息
 */
export function findBestScenario(scenarios) {
  const scenarioList = [
    { name: '基础方案', key: 'scenario1', data: scenarios.scenario1 },
    { name: '转月工资', key: 'scenario2', data: scenarios.scenario2 },
    { name: '转期权', key: 'scenario3', data: scenarios.scenario3 }
  ]

  let best = scenarioList[0]
  for (const scenario of scenarioList) {
    if (scenario.data.disposableIncome > best.data.disposableIncome) {
      best = scenario
    }
  }

  // 计算节税金额
  const baseTax = scenarios.scenario1.totalTax
  const savings = Math.round((baseTax - best.data.totalTax) * 100) / 100

  return {
    ...best,
    savings
  }
}
