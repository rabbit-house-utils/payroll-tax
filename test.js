// 测试计算功能

import { calculateInsuranceAndFund } from './src/utils/socialInsurance.js'
import { calculateMonthlySalaryTax } from './src/utils/monthlySalary.js'
import { calculateYearEndBonusTax } from './src/utils/yearEndBonus.js'
import { calculateScenario, generateScenarios, findBestScenario } from './src/utils/optimizer.js'

console.log('=== 薪资税务计算器测试 ===\n')

// 测试用例：月工资30000，年终奖140000
const testParams = {
  monthlySalary: 30000,
  yearEndBonus: 140000,
  socialWage: 11937,
  specialDeduction: 0,
  allowSalaryConversion: true,
  allowOptionConversion: true,
  optionConversionRatio: 0.75,
  incomeType: 'option',
  vestingSchedule: [{ years: 4, amount: 0 }],
  baseOptionAmount: 0
}

console.log('测试参数：')
console.log(`月工资: ¥${testParams.monthlySalary.toLocaleString()}`)
console.log(`年终奖: ¥${testParams.yearEndBonus.toLocaleString()}`)
console.log(`社平工资: ¥${testParams.socialWage.toLocaleString()}\n`)

// 测试五险一金计算
console.log('--- 五险一金计算 ---')
const insurance = calculateInsuranceAndFund(
  testParams.monthlySalary,
  testParams.yearEndBonus,
  testParams.socialWage
)
console.log(`缴费基数: ¥${insurance.contributionBase.toFixed(2)}`)
console.log(`社保月缴: ¥${insurance.socialInsurance.total.toFixed(2)}`)
console.log(`公积金月缴: ¥${insurance.housingFund.personal}`)
console.log(`月度合计: ¥${insurance.monthlyTotal.toFixed(2)}\n`)

// 测试月工资税计算
console.log('--- 月工资税计算 ---')
const salaryTax = calculateMonthlySalaryTax(
  testParams.monthlySalary,
  insurance.socialInsurance.total,
  insurance.housingFund.personal,
  testParams.specialDeduction
)
console.log(`年度应纳税所得额: ¥${salaryTax.annualTaxableIncome.toFixed(2)}`)
console.log(`年度个税: ¥${salaryTax.annualTax.toFixed(2)}`)
console.log(`月均个税: ¥${salaryTax.monthlyTax.toFixed(2)}`)
console.log(`税后月工资: ¥${salaryTax.afterTaxSalary.toFixed(2)}\n`)

// 测试年终奖税计算
console.log('--- 年终奖税计算 ---')
const bonusTax = calculateYearEndBonusTax(testParams.yearEndBonus)
console.log(`年终奖: ¥${bonusTax.grossBonus.toLocaleString()}`)
console.log(`年终奖税: ¥${bonusTax.tax.toFixed(2)}`)
console.log(`税后年终奖: ¥${bonusTax.afterTaxBonus.toFixed(2)}\n`)

// 测试完整方案计算
console.log('--- 基础方案计算 ---')
const baseScenario = calculateScenario(testParams)
console.log(`年度总收入: ¥${baseScenario.totalGrossIncome.toLocaleString()}`)
console.log(`总税额: ¥${baseScenario.totalTax.toFixed(2)}`)
console.log(`可支配收入: ¥${baseScenario.disposableIncome.toFixed(2)}`)
console.log(`含公积金收入: ¥${baseScenario.withHousingFund.toFixed(2)}\n`)

// 测试四种方案对比
console.log('--- 四种方案对比 ---')
const scenarios = generateScenarios(testParams)
const bestScenario = findBestScenario(scenarios)

console.log('方案1 - 基础方案:')
console.log(`  可支配收入: ¥${scenarios.scenario1.disposableIncome.toFixed(2)}`)

console.log('方案2 - 转月工资:')
console.log(`  转换金额: ¥${scenarios.scenario2.bonusToSalary.toLocaleString()}`)
console.log(`  可支配收入: ¥${scenarios.scenario2.disposableIncome.toFixed(2)}`)

console.log('方案3 - 转期权:')
console.log(`  转换金额: ¥${scenarios.scenario3.bonusToOption.toLocaleString()}`)
console.log(`  可支配收入: ¥${scenarios.scenario3.disposableIncome.toFixed(2)}`)

console.log('方案4 - 双转换:')
console.log(`  转月工资: ¥${scenarios.scenario4.bonusToSalary.toLocaleString()}`)
console.log(`  转期权: ¥${scenarios.scenario4.bonusToOption.toLocaleString()}`)
console.log(`  可支配收入: ¥${scenarios.scenario4.disposableIncome.toFixed(2)}`)

console.log(`\n最优方案: ${bestScenario.name}`)
console.log(`节税金额: ¥${bestScenario.savings.toFixed(2)}`)

console.log('\n=== 测试完成 ===')
