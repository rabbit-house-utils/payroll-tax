// 测试新的期权计算逻辑（边际税率方法）

import { calculateGrantValue, calculateTotalOptionValue, calculateOptionTax } from './src/utils/stockOptions.js'
import { calculateScenario } from './src/utils/optimizer.js'

console.log('=== 测试期权计算逻辑（边际税率方法）===\n')

// 测试数据 - 多笔期权授予
const grant1 = {
  totalShares: 10000,
  strikePrice: 10,
  totalYears: 4,
  vestedYears: 1  // 已归属1年，还剩3年
}

const grant2 = {
  totalShares: 8000,
  strikePrice: 15,
  totalYears: 4,
  vestedYears: 0  // 刚授予，还剩4年
}

const currentStockPrice = 50
const exchangeRate = 7.2

console.log('测试授予信息:')
console.log('授予1:')
console.log('- 总股数:', grant1.totalShares)
console.log('- 行权价:', grant1.strikePrice, '美元')
console.log('- 总归属年数:', grant1.totalYears)
console.log('- 已归属年数:', grant1.vestedYears)
console.log()
console.log('授予2:')
console.log('- 总股数:', grant2.totalShares)
console.log('- 行权价:', grant2.strikePrice, '美元')
console.log('- 总归属年数:', grant2.totalYears)
console.log('- 已归属年数:', grant2.vestedYears)
console.log()
console.log('- 当前股价:', currentStockPrice, '美元')
console.log('- 汇率:', exchangeRate)
console.log()

// 测试单个授予价值计算
const grantValue1 = calculateGrantValue(grant1, currentStockPrice, exchangeRate)
console.log('授予1价值:')
console.log('- 未归属股数:', grantValue1.unvestedShares)
console.log('- 每股价值:', grantValue1.valuePerShare, '美元')
console.log('- 总价值(美元):', grantValue1.totalValueUSD)
console.log('- 总价值(人民币):', grantValue1.totalValueCNY)
console.log()

const grantValue2 = calculateGrantValue(grant2, currentStockPrice, exchangeRate)
console.log('授予2价值:')
console.log('- 未归属股数:', grantValue2.unvestedShares)
console.log('- 每股价值:', grantValue2.valuePerShare, '美元')
console.log('- 总价值(美元):', grantValue2.totalValueUSD)
console.log('- 总价值(人民币):', grantValue2.totalValueCNY)
console.log()

// 测试总期权价值
const optionGrants = [grant1, grant2]
const totalValue = calculateTotalOptionValue(optionGrants, currentStockPrice, exchangeRate)
console.log('总期权价值(人民币):', totalValue)
console.log()

// 测试期权税计算（不含年终奖转换）
console.log('=== 测试期权税计算（边际税率方法）===\n')
const optionTax = calculateOptionTax(totalValue, optionGrants, currentStockPrice, exchangeRate, 0)
console.log('期权税务明细:')
console.log('- 期权总额:', optionTax.totalAmount)
console.log('- 总税额:', optionTax.totalTax)
console.log('- 归属年限:', optionTax.vestingYears)
console.log('- 每年税额:', optionTax.yearlyTax)
console.log('- 税后金额:', optionTax.afterTaxAmount)
console.log()
console.log('各授予税务明细:')
optionTax.grantTaxDetails.forEach((detail, index) => {
  console.log(`授予${index + 1}:`)
  console.log('  - 金额:', detail.amount)
  console.log('  - 归属年数:', detail.vestingYears)
  console.log('  - 授予税额:', detail.grantTax)
  console.log('  - 每年税额:', detail.yearlyTax)
  console.log('  - 类型:', detail.type)
})
console.log()

// 测试年终奖转期权
console.log('=== 测试年终奖转期权 ===\n')
const bonusToOption = 50000  // 5万年终奖转期权
const conversionRatio = 0.75  // 75折 (用75元年终奖换购100元期权)
const convertedAmount = bonusToOption / conversionRatio  // 期权价值 = 年终奖 / 转换比例
console.log('年终奖转期权金额:', bonusToOption)
console.log('转换比例:', conversionRatio, '(用75元年终奖换购100元期权)')
console.log('转换后期权价值:', convertedAmount)
console.log()

const optionTaxWithBonus = calculateOptionTax(
  totalValue + convertedAmount,
  optionGrants,
  currentStockPrice,
  exchangeRate,
  convertedAmount
)
console.log('含年终奖转换的期权税务明细:')
console.log('- 期权总额:', optionTaxWithBonus.totalAmount)
console.log('- 总税额:', optionTaxWithBonus.totalTax)
console.log('- 每年税额:', optionTaxWithBonus.yearlyTax)
console.log('- 税后金额:', optionTaxWithBonus.afterTaxAmount)
console.log()
console.log('各授予税务明细:')
optionTaxWithBonus.grantTaxDetails.forEach((detail, index) => {
  console.log(`授予${index + 1} (${detail.type}):`)
  console.log('  - 金额:', detail.amount)
  console.log('  - 归属年数:', detail.vestingYears)
  console.log('  - 授予税额:', detail.grantTax)
  console.log('  - 每年税额:', detail.yearlyTax)
})
console.log()
console.log('年终奖转期权增加的年度税额:', optionTaxWithBonus.yearlyTax - optionTax.yearlyTax)
console.log()

// 测试完整方案计算
console.log('=== 测试完整方案计算 ===\n')
const params = {
  monthlySalary: 30000,
  yearEndBonus: 140000,
  socialWage: 11937,
  specialDeduction: 0,
  allowSalaryConversion: true,
  allowOptionConversion: true,
  optionConversionRatio: 0.75,
  hasListedEquity: false,
  listedEquityShares: 0,
  listedEquityVestPrice: 0,
  listedEquityStrikePrice: 0,
  hasUnlistedOptions: true,
  optionGrants: optionGrants,
  currentStockPrice: currentStockPrice,
  exchangeRate: exchangeRate
}

const result = calculateScenario(params)
console.log('方案计算结果:')
console.log('- 月工资:', result.monthlySalary)
console.log('- 年终奖:', result.yearEndBonus)
console.log('- 期权金额:', result.equityAmount)
console.log('- 总收入:', result.totalGrossIncome)
console.log('- 总税额:', result.totalTax)
console.log('- 可支配收入:', result.disposableIncome)
console.log('- 含公积金收入:', result.withHousingFund)
console.log()

console.log('✅ 测试完成')
