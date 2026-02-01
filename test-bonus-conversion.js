// 测试年终奖转期权的税额计算逻辑

import { calculateOptionTax } from './src/utils/stockOptions.js'
import { calculateYearEndBonusTax } from './src/utils/yearEndBonus.js'

console.log('=== 测试年终奖转期权的税额计算逻辑 ===\n')

// 场景：有两笔期权授予，考虑将部分年终奖转为期权
const grant1 = {
  totalShares: 10000,
  strikePrice: 10,
  totalYears: 4,
  vestedYears: 1
}

const grant2 = {
  totalShares: 8000,
  strikePrice: 15,
  totalYears: 4,
  vestedYears: 0
}

const currentStockPrice = 50
const exchangeRate = 7.2
const optionGrants = [grant1, grant2]

// 计算期权价值
const grant1Value = (10000 * (4 - 1) / 4) * (50 - 10) * 7.2  // 2,160,000
const grant2Value = 8000 * (50 - 15) * 7.2  // 2,016,000
const totalOptionValue = grant1Value + grant2Value  // 4,176,000

console.log('现有期权情况:')
console.log('- 授予1价值:', grant1Value, 'CNY')
console.log('- 授予2价值:', grant2Value, 'CNY')
console.log('- 总期权价值:', totalOptionValue, 'CNY')
console.log()

// 不转换年终奖的情况
const optionTaxBase = calculateOptionTax(totalOptionValue, optionGrants, currentStockPrice, exchangeRate, 0)
console.log('不转换年终奖时的期权税:')
console.log('- 总税额:', optionTaxBase.totalTax)
console.log('- 每年税额:', optionTaxBase.yearlyTax)
console.log()

// 年终奖情况
const yearEndBonus = 50000
const bonusTax = calculateYearEndBonusTax(yearEndBonus)
console.log('年终奖税务:')
console.log('- 年终奖金额:', yearEndBonus)
console.log('- 年终奖税额:', bonusTax.tax)
console.log()

// 转换年终奖为期权（75折）
const conversionRatio = 0.75
const convertedAmount = yearEndBonus / conversionRatio  // 期权价值 = 年终奖 / 转换比例
const totalWithBonus = totalOptionValue + convertedAmount

console.log('转换年终奖为期权:')
console.log('- 转换金额:', yearEndBonus)
console.log('- 转换比例:', conversionRatio, '(用75元年终奖换购100元期权)')
console.log('- 转换后期权价值:', convertedAmount)
console.log('- 总期权价值:', totalWithBonus)
console.log()

const optionTaxWithBonus = calculateOptionTax(totalWithBonus, optionGrants, currentStockPrice, exchangeRate, convertedAmount)
console.log('转换后的期权税:')
console.log('- 总税额:', optionTaxWithBonus.totalTax)
console.log('- 每年税额:', optionTaxWithBonus.yearlyTax)
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

// 计算边际效应
const marginalYearlyTax = optionTaxWithBonus.yearlyTax - optionTaxBase.yearlyTax
console.log('边际效应分析:')
console.log('- 年终奖转期权增加的年度税额:', marginalYearlyTax)
console.log('- 原年终奖税额:', bonusTax.tax)
console.log('- 税额差异:', bonusTax.tax - marginalYearlyTax)
console.log()

// 验证逻辑正确性
console.log('=== 验证边际税率计算逻辑 ===\n')

// 手动计算验证
console.log('手动验证:')
console.log('1. 授予1累计金额:', grant1Value)
console.log('   税额:', optionTaxWithBonus.grantTaxDetails[0].grantTax)
console.log()

console.log('2. 授予1+2累计金额:', grant1Value + grant2Value)
console.log('   累计税额:', optionTaxWithBonus.grantTaxDetails[0].grantTax + optionTaxWithBonus.grantTaxDetails[1].grantTax)
console.log()

console.log('3. 授予1+2+年终奖累计金额:', grant1Value + grant2Value + convertedAmount)
console.log('   累计税额:', optionTaxWithBonus.totalTax)
console.log()

// 验证年度税额计算
const expectedYearlyTax =
  optionTaxWithBonus.grantTaxDetails[0].yearlyTax +  // 授予1
  optionTaxWithBonus.grantTaxDetails[1].yearlyTax +  // 授予2
  optionTaxWithBonus.grantTaxDetails[2].yearlyTax    // 年终奖转期权

console.log('验证年度税额:')
console.log('- 授予1年度税额:', optionTaxWithBonus.grantTaxDetails[0].yearlyTax)
console.log('- 授予2年度税额:', optionTaxWithBonus.grantTaxDetails[1].yearlyTax)
console.log('- 年终奖转期权年度税额:', optionTaxWithBonus.grantTaxDetails[2].yearlyTax)
console.log('- 总年度税额:', expectedYearlyTax)
console.log('- 计算的年度税额:', optionTaxWithBonus.yearlyTax)
console.log('- 是否一致:', Math.abs(expectedYearlyTax - optionTaxWithBonus.yearlyTax) < 0.01 ? '✓' : '✗')
console.log()

console.log('✅ 测试完成')
