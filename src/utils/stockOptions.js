// 股票/期权计算

import { MONTHLY_TAX_TABLE } from './taxTables.js'
import { calculateTaxByTable } from './monthlySalary.js'

/**
 * 计算已上市公司股票/期权收入
 * @param {number} shares - 股数
 * @param {number} vestPrice - 归属股价（美元）
 * @param {number} strikePrice - 行权价（美元，RSU为0）
 * @param {number} exchangeRate - 汇率
 * @returns {number} 收入（人民币）
 */
export function calculateListedEquityIncome(shares, vestPrice, strikePrice, exchangeRate) {
  if (shares <= 0 || vestPrice <= 0) {
    return 0
  }

  const valuePerShare = Math.max(0, vestPrice - strikePrice)
  const totalValueUSD = shares * valuePerShare
  const totalValueCNY = totalValueUSD * exchangeRate

  return Math.round(totalValueCNY * 100) / 100
}

/**
 * 计算单个授予的未归属期权价值（人民币）
 * @param {object} grant - 授予信息
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @returns {object} 期权价值信息
 */
export function calculateGrantValue(grant, currentStockPrice, exchangeRate) {
  const { totalShares, strikePrice, vestedYears, totalYears } = grant

  // 计算未归属的股数（均匀归属）
  const unvestedYears = totalYears - vestedYears
  const unvestedShares = (totalShares * unvestedYears) / totalYears

  // 计算期权价值（美元）
  const valuePerShare = Math.max(0, currentStockPrice - strikePrice)
  const totalValueUSD = unvestedShares * valuePerShare

  // 转换为人民币
  const totalValueCNY = totalValueUSD * exchangeRate

  return {
    unvestedShares: Math.round(unvestedShares * 100) / 100,
    valuePerShare: Math.round(valuePerShare * 100) / 100,
    totalValueUSD: Math.round(totalValueUSD * 100) / 100,
    totalValueCNY: Math.round(totalValueCNY * 100) / 100
  }
}

/**
 * 计算所有授予的总期权价值
 * @param {Array} optionGrants - 授予列表
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @returns {number} 总期权价值（人民币）
 */
export function calculateTotalOptionValue(optionGrants, currentStockPrice, exchangeRate) {
  if (!optionGrants || optionGrants.length === 0) {
    return 0
  }

  let totalValue = 0
  optionGrants.forEach(grant => {
    const { totalValueCNY } = calculateGrantValue(grant, currentStockPrice, exchangeRate)
    totalValue += totalValueCNY
  })

  return Math.round(totalValue * 100) / 100
}

/**
 * 计算期权归属的年度分配
 * @param {Array} optionGrants - 授予列表
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @returns {object} 每年归属金额
 */
export function calculateVestingDistribution(optionGrants, currentStockPrice, exchangeRate) {
  const yearlyVesting = {}

  if (!optionGrants || optionGrants.length === 0) {
    return yearlyVesting
  }

  optionGrants.forEach(grant => {
    const { totalShares, strikePrice, vestedYears, totalYears } = grant
    const valuePerShare = Math.max(0, currentStockPrice - strikePrice)

    // 每年归属的股数（均匀归属）
    const sharesPerYear = totalShares / totalYears

    // 计算未归属的年数
    const unvestedYears = totalYears - vestedYears

    // 为每个未归属的年份计算归属金额
    for (let i = 0; i < unvestedYears; i++) {
      const valueUSD = sharesPerYear * valuePerShare
      const valueCNY = valueUSD * exchangeRate

      // yearIndex 从1开始（表示未来第1年、第2年...）
      const yearIndex = i + 1

      yearlyVesting[yearIndex] = (yearlyVesting[yearIndex] || 0) + valueCNY
    }
  })

  // 四舍五入
  Object.keys(yearlyVesting).forEach(year => {
    yearlyVesting[year] = Math.round(yearlyVesting[year] * 100) / 100
  })

  return yearlyVesting
}

/**
 * 计算期权税（多年归属，分年缴纳，使用边际税率方法）
 * @param {number} totalAmount - 期权总额（人民币）
 * @param {Array} optionGrants - 授予列表
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @param {number} bonusToOptionAmount - 年终奖转期权金额（人民币）
 * @returns {object} 期权税务明细
 */
export function calculateOptionTax(totalAmount, optionGrants, currentStockPrice, exchangeRate, bonusToOptionAmount = 0) {
  if (totalAmount <= 0) {
    return {
      totalAmount: 0,
      totalTax: 0,
      yearlyTax: 0,
      afterTaxAmount: 0,
      vestingYears: 0,
      grantTaxDetails: []
    }
  }

  // 构建授予列表（包括年终奖转期权）
  const allGrants = []

  // 添加原有期权授予
  if (optionGrants && optionGrants.length > 0) {
    optionGrants.forEach(grant => {
      const grantValue = calculateGrantValue(grant, currentStockPrice, exchangeRate)
      if (grantValue.totalValueCNY > 0) {
        const remainingYears = grant.totalYears - grant.vestedYears
        allGrants.push({
          amount: grantValue.totalValueCNY,
          vestingYears: remainingYears,
          type: 'option'
        })
      }
    })
  }

  // 添加年终奖转期权（视为1年归属的新授予）
  if (bonusToOptionAmount > 0) {
    allGrants.push({
      amount: bonusToOptionAmount,
      vestingYears: 1,
      type: 'bonus'
    })
  }

  if (allGrants.length === 0) {
    return {
      totalAmount: 0,
      totalTax: 0,
      yearlyTax: 0,
      afterTaxAmount: 0,
      vestingYears: 0,
      grantTaxDetails: []
    }
  }

  // 计算每笔授予的边际税额
  let cumulativeAmount = 0
  let cumulativeTax = 0
  let totalYearlyTax = 0
  const grantTaxDetails = []

  allGrants.forEach((grant, index) => {
    // 累计金额（当前授予 + 之前所有授予）
    cumulativeAmount += grant.amount

    // 计算累计税额
    const newCumulativeTax = calculateTaxByTable(cumulativeAmount, MONTHLY_TAX_TABLE)

    // 当前授予的边际税额 = 新累计税额 - 之前累计税额
    const grantTax = newCumulativeTax - cumulativeTax

    // 每年分摊的税额
    const yearlyTax = grant.vestingYears > 0
      ? Math.round(grantTax / grant.vestingYears * 100) / 100
      : grantTax

    // 累加到总年度税额
    totalYearlyTax += yearlyTax

    grantTaxDetails.push({
      grantIndex: index,
      amount: grant.amount,
      vestingYears: grant.vestingYears,
      grantTax: Math.round(grantTax * 100) / 100,
      yearlyTax: yearlyTax,
      type: grant.type
    })

    // 更新累计税额
    cumulativeTax = newCumulativeTax
  })

  // 计算最大归属年限（用于显示）
  const maxVestingYears = Math.max(...allGrants.map(g => g.vestingYears))

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalTax: Math.round(cumulativeTax * 100) / 100,
    yearlyTax: Math.round(totalYearlyTax * 100) / 100,
    afterTaxAmount: Math.round((totalAmount - cumulativeTax) * 100) / 100,
    vestingYears: maxVestingYears,
    grantTaxDetails
  }
}

/**
 * 计算股票税（一次性归属）
 * @param {number} amount - 股票金额
 * @returns {object} 股票税务明细
 */
export function calculateStockTax(amount) {
  if (amount <= 0) {
    return {
      totalAmount: 0,
      tax: 0,
      afterTaxAmount: 0
    }
  }

  const tax = calculateTaxByTable(amount, MONTHLY_TAX_TABLE)
  const afterTaxAmount = Math.round((amount - tax) * 100) / 100

  return {
    totalAmount: amount,
    tax,
    afterTaxAmount
  }
}

/**
 * 计算年终奖转期权的边际税额
 * @param {number} bonusToConvert - 要转换的年终奖金额
 * @param {number} conversionRatio - 转换比例（如0.75表示用75元年终奖换购100元期权）
 * @param {Array} optionGrants - 当前授予列表
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @returns {number} 边际税额
 */
export function calculateOptionMarginalTax(bonusToConvert, conversionRatio, optionGrants, currentStockPrice, exchangeRate) {
  if (bonusToConvert <= 0) return 0

  // 计算当前期权总价值
  const baseOptionValue = calculateTotalOptionValue(optionGrants, currentStockPrice, exchangeRate)

  // 计算基准期权税（不包含年终奖转换）
  const baseTaxResult = calculateOptionTax(baseOptionValue, optionGrants, currentStockPrice, exchangeRate, 0)
  const baseYearlyTax = baseTaxResult.yearlyTax

  // 年终奖转换为期权后的增量价值（考虑折扣）
  // 公式: 期权价值 = 年终奖金额 / 转换比例
  const additionalOptionValue = bonusToConvert / conversionRatio

  // 计算增加期权后的总税额（包含年终奖转换）
  const totalOptionValue = baseOptionValue + additionalOptionValue
  const totalTaxResult = calculateOptionTax(totalOptionValue, optionGrants, currentStockPrice, exchangeRate, additionalOptionValue)
  const totalYearlyTax = totalTaxResult.yearlyTax

  // 边际年度税额（增加的年度税额）
  const marginalYearlyTax = totalYearlyTax - baseYearlyTax

  return Math.round(marginalYearlyTax * 100) / 100
}

/**
 * 计算年终奖转期权（考虑折扣）
 * @param {number} bonusAmount - 年终奖金额
 * @param {number} conversionRatio - 转换比例（如0.75表示用75元年终奖换购100元期权）
 * @param {Array} optionGrants - 当前授予列表
 * @param {number} currentStockPrice - 当前股价（美元）
 * @param {number} exchangeRate - 汇率
 * @returns {object} 转换明细
 */
export function calculateBonusToOption(bonusAmount, conversionRatio, optionGrants, currentStockPrice, exchangeRate) {
  if (bonusAmount <= 0) {
    return {
      bonusAmount: 0,
      optionAmount: 0,
      marginalTax: 0,
      effectiveTaxRate: 0
    }
  }

  // 转换后的期权金额（考虑折扣）
  // 公式: 期权价值 = 年终奖金额 / 转换比例
  const optionAmount = bonusAmount / conversionRatio

  // 计算边际税额
  const marginalTax = calculateOptionMarginalTax(bonusAmount, conversionRatio, optionGrants, currentStockPrice, exchangeRate)

  // 有效税率
  const effectiveTaxRate = marginalTax / bonusAmount

  return {
    bonusAmount,
    optionAmount,
    marginalTax,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10000) / 100 // 转换为百分比
  }
}
