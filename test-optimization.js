// 测试优化功能 - 高年终奖场景

import { generateScenarios, findBestScenario } from './src/utils/optimizer.js'

console.log('=== 高年终奖优化测试 ===\n')

// 测试用例：月工资20000，年终奖300000（年终奖占比高）
const testParams = {
  monthlySalary: 20000,
  yearEndBonus: 300000,
  socialWage: 11937,
  specialDeduction: 0,
  allowSalaryConversion: true,
  allowOptionConversion: false,
  optionConversionRatio: 0.75,
  incomeType: 'option',
  vestingSchedule: [{ years: 4, amount: 0 }],
  baseOptionAmount: 0
}

console.log('测试参数：')
console.log(`月工资: ¥${testParams.monthlySalary.toLocaleString()}`)
console.log(`年终奖: ¥${testParams.yearEndBonus.toLocaleString()}`)
console.log(`年收入: ¥${(testParams.monthlySalary * 12 + testParams.yearEndBonus).toLocaleString()}\n`)

const scenarios = generateScenarios(testParams)
const bestScenario = findBestScenario(scenarios)

console.log('--- 四种方案对比 ---\n')

console.log('方案1 - 基础方案:')
console.log(`  月工资: ¥${scenarios.scenario1.monthlySalary.toFixed(2)}`)
console.log(`  年终奖: ¥${scenarios.scenario1.yearEndBonus.toFixed(2)}`)
console.log(`  总税额: ¥${scenarios.scenario1.totalTax.toFixed(2)}`)
console.log(`  可支配收入: ¥${scenarios.scenario1.disposableIncome.toFixed(2)}\n`)

console.log('方案2 - 转月工资:')
console.log(`  转换金额: ¥${scenarios.scenario2.bonusToSalary.toLocaleString()}`)
console.log(`  月工资: ¥${scenarios.scenario2.monthlySalary.toFixed(2)}`)
console.log(`  年终奖: ¥${scenarios.scenario2.yearEndBonus.toFixed(2)}`)
console.log(`  总税额: ¥${scenarios.scenario2.totalTax.toFixed(2)}`)
console.log(`  可支配收入: ¥${scenarios.scenario2.disposableIncome.toFixed(2)}\n`)

const improvement = scenarios.scenario2.disposableIncome - scenarios.scenario1.disposableIncome
const taxSavings = scenarios.scenario1.totalTax - scenarios.scenario2.totalTax

console.log('--- 优化效果 ---')
console.log(`最优方案: ${bestScenario.name}`)
console.log(`节税金额: ¥${taxSavings.toFixed(2)}`)
console.log(`收入增加: ¥${improvement.toFixed(2)}`)
console.log(`优化幅度: ${(improvement / scenarios.scenario1.disposableIncome * 100).toFixed(2)}%`)

console.log('\n=== 测试完成 ===')
