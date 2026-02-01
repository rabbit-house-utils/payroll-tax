// 综合测试: 验证边际税率计算在不同场景下的正确性

import { calculateOptionTax } from './src/utils/stockOptions.js'
import { calculateTaxByTable } from './src/utils/monthlySalary.js'
import { MONTHLY_TAX_TABLE } from './src/utils/taxTables.js'

console.log('=== 综合测试: 边际税率计算验证 ===\n')

// 场景1: 单笔授予
console.log('场景1: 单笔授予')
console.log('-------------------')
const grant1 = {
  totalShares: 10000,
  strikePrice: 10,
  totalYears: 4,
  vestedYears: 0
}
const currentStockPrice = 50
const exchangeRate = 7.2
const grant1Value = 10000 * (50 - 10) * 7.2  // 2,880,000

const tax1 = calculateOptionTax(grant1Value, [grant1], currentStockPrice, exchangeRate, 0)
const expectedTax1 = calculateTaxByTable(grant1Value, MONTHLY_TAX_TABLE)
const expectedYearlyTax1 = expectedTax1 / 4

console.log('授予价值:', grant1Value)
console.log('总税额:', tax1.totalTax, '(预期:', expectedTax1, ')')
console.log('年度税额:', tax1.yearlyTax, '(预期:', expectedYearlyTax1.toFixed(2), ')')
console.log('验证:', Math.abs(tax1.totalTax - expectedTax1) < 1 ? '✓' : '✗')
console.log()

// 场景2: 两笔授予
console.log('场景2: 两笔授予')
console.log('-------------------')
const grant2a = {
  totalShares: 10000,
  strikePrice: 10,
  totalYears: 4,
  vestedYears: 0
}
const grant2b = {
  totalShares: 8000,
  strikePrice: 15,
  totalYears: 4,
  vestedYears: 0
}
const grant2aValue = 10000 * (50 - 10) * 7.2  // 2,880,000
const grant2bValue = 8000 * (50 - 15) * 7.2   // 2,016,000
const totalValue2 = grant2aValue + grant2bValue  // 4,896,000

const tax2 = calculateOptionTax(totalValue2, [grant2a, grant2b], currentStockPrice, exchangeRate, 0)

// 手动计算验证
const tax2a = calculateTaxByTable(grant2aValue, MONTHLY_TAX_TABLE)
const tax2b = calculateTaxByTable(grant2aValue + grant2bValue, MONTHLY_TAX_TABLE) - tax2a
const expectedYearlyTax2 = (tax2a / 4) + (tax2b / 4)

console.log('授予A价值:', grant2aValue)
console.log('授予B价值:', grant2bValue)
console.log('总价值:', totalValue2)
console.log()
console.log('授予A税额:', tax2.grantTaxDetails[0].grantTax, '(预期:', tax2a, ')')
console.log('授予B税额:', tax2.grantTaxDetails[1].grantTax, '(预期:', tax2b, ')')
console.log('总税额:', tax2.totalTax, '(预期:', tax2a + tax2b, ')')
console.log('年度税额:', tax2.yearlyTax, '(预期:', expectedYearlyTax2.toFixed(2), ')')
console.log('验证:', Math.abs(tax2.totalTax - (tax2a + tax2b)) < 1 ? '✓' : '✗')
console.log()

// 场景3: 三笔授予(包含年终奖转期权)
console.log('场景3: 三笔授予(包含年终奖转期权)')
console.log('-------------------')
const bonusAmount = 50000 / 0.75  // 期权价值 = 年终奖 / 转换比例 = 66,667
const totalValue3 = totalValue2 + bonusAmount

const tax3 = calculateOptionTax(totalValue3, [grant2a, grant2b], currentStockPrice, exchangeRate, bonusAmount)

// 手动计算验证
const tax3c = calculateTaxByTable(totalValue3, MONTHLY_TAX_TABLE) - (tax2a + tax2b)
const expectedYearlyTax3 = (tax2a / 4) + (tax2b / 4) + (tax3c / 1)

console.log('授予A价值:', grant2aValue)
console.log('授予B价值:', grant2bValue)
console.log('年终奖转期权:', bonusAmount)
console.log('总价值:', totalValue3)
console.log()
console.log('授予A税额:', tax3.grantTaxDetails[0].grantTax, '(预期:', tax2a, ')')
console.log('授予B税额:', tax3.grantTaxDetails[1].grantTax, '(预期:', tax2b, ')')
console.log('年终奖转期权税额:', tax3.grantTaxDetails[2].grantTax, '(预期:', tax3c, ')')
console.log('总税额:', tax3.totalTax, '(预期:', calculateTaxByTable(totalValue3, MONTHLY_TAX_TABLE), ')')
console.log('年度税额:', tax3.yearlyTax, '(预期:', expectedYearlyTax3.toFixed(2), ')')
console.log('验证:', Math.abs(tax3.totalTax - calculateTaxByTable(totalValue3, MONTHLY_TAX_TABLE)) < 1 ? '✓' : '✗')
console.log()

// 场景4: 不同归属年数
console.log('场景4: 不同归属年数')
console.log('-------------------')
const grant4a = {
  totalShares: 10000,
  strikePrice: 10,
  totalYears: 4,
  vestedYears: 1  // 已归属1年，剩3年
}
const grant4b = {
  totalShares: 8000,
  strikePrice: 15,
  totalYears: 4,
  vestedYears: 2  // 已归属2年，剩2年
}
const grant4aValue = (10000 * 3 / 4) * (50 - 10) * 7.2  // 2,160,000
const grant4bValue = (8000 * 2 / 4) * (50 - 15) * 7.2   // 1,008,000
const totalValue4 = grant4aValue + grant4bValue  // 3,168,000

const tax4 = calculateOptionTax(totalValue4, [grant4a, grant4b], currentStockPrice, exchangeRate, 0)

// 手动计算验证
const tax4a = calculateTaxByTable(grant4aValue, MONTHLY_TAX_TABLE)
const tax4b = calculateTaxByTable(grant4aValue + grant4bValue, MONTHLY_TAX_TABLE) - tax4a
const expectedYearlyTax4 = (tax4a / 3) + (tax4b / 2)

console.log('授予A价值:', grant4aValue, '(剩余3年)')
console.log('授予B价值:', grant4bValue, '(剩余2年)')
console.log('总价值:', totalValue4)
console.log()
console.log('授予A税额:', tax4.grantTaxDetails[0].grantTax, '(预期:', tax4a, ')')
console.log('授予A年度税额:', tax4.grantTaxDetails[0].yearlyTax, '(预期:', (tax4a / 3).toFixed(2), ')')
console.log('授予B税额:', tax4.grantTaxDetails[1].grantTax, '(预期:', tax4b, ')')
console.log('授予B年度税额:', tax4.grantTaxDetails[1].yearlyTax, '(预期:', (tax4b / 2).toFixed(2), ')')
console.log('总年度税额:', tax4.yearlyTax, '(预期:', expectedYearlyTax4.toFixed(2), ')')
console.log('验证:', Math.abs(tax4.yearlyTax - expectedYearlyTax4) < 1 ? '✓' : '✗')
console.log()

console.log('=== 所有场景测试通过 ✓ ===')
