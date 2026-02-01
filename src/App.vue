<template>
  <div id="app">
    <header class="app-header">
      <h1>薪资税务计算器</h1>
      <p class="subtitle">计算可支配收入与税务优化方案</p>
    </header>

    <main class="app-main">
      <InputForm
        v-model:monthlySalary="state.monthlySalary"
        v-model:yearEndBonus="state.yearEndBonus"
        v-model:socialWage="state.socialWage"
        v-model:deductions="state.deductions"
        v-model:useCustomDeduction="state.useCustomDeduction"
        v-model:allowSalaryConversion="state.allowSalaryConversion"
        v-model:allowOptionConversion="state.allowOptionConversion"
        v-model:optionConversionRatio="state.optionConversionRatio"
        v-model:hasListedEquity="state.hasListedEquity"
        v-model:listedEquityShares="state.listedEquityShares"
        v-model:listedEquityVestPrice="state.listedEquityVestPrice"
        v-model:listedEquityStrikePrice="state.listedEquityStrikePrice"
        v-model:hasUnlistedOptions="state.hasUnlistedOptions"
        v-model:optionGrants="state.optionGrants"
        v-model:currentStockPrice="state.currentStockPrice"
        v-model:exchangeRate="state.exchangeRate"
      />

      <ResultTabs
        v-if="state.results"
        :current="state.results"
        :scenarios="state.scenarios"
        :bestScenario="state.bestScenario"
        :allowSalaryConversion="state.allowSalaryConversion"
        :allowOptionConversion="state.allowOptionConversion"
      />
    </main>

    <footer class="app-footer">
      <p>© 2026 薪资税务计算器 | 仅供参考，不构成税务建议</p>
    </footer>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import InputForm from './components/InputForm.vue'
import ResultTabs from './components/ResultTabs.vue'
import { calculateScenario, generateScenarios, findBestScenario } from './utils/optimizer.js'
import { DEDUCTION_STANDARDS } from './utils/taxTables.js'

// 状态管理
const state = reactive({
  // 基本输入
  monthlySalary: 30000,
  yearEndBonus: 140000,
  socialWage: 11937,

  // 专项附加扣除
  deductions: {
    childEducation: 0,
    housingLoanInterest: false,
    housingRent: false,
    elderCare: false,
    personalPension: false,
    customAmount: 0
  },
  useCustomDeduction: false,

  // 年终奖转换选项
  allowSalaryConversion: true,
  allowOptionConversion: false,
  optionConversionRatio: 0.75,

  // 股票或已上市公司期权
  hasListedEquity: false,
  listedEquityShares: 0,
  listedEquityVestPrice: 0,
  listedEquityStrikePrice: 0,

  // 未上市公司期权
  hasUnlistedOptions: false,
  optionGrants: [{
    totalShares: 0,
    strikePrice: 0,
    totalYears: 4,
    vestedYears: 0
  }],
  currentStockPrice: 0,
  exchangeRate: 7.2,

  // 计算结果
  results: null,
  scenarios: null,
  bestScenario: null
})

// 计算专项附加扣除总额
function calculateSpecialDeduction() {
  if (state.useCustomDeduction) {
    return state.deductions.customAmount
  }

  let total = 0
  total += state.deductions.childEducation * DEDUCTION_STANDARDS.childEducation
  total += state.deductions.housingLoanInterest ? DEDUCTION_STANDARDS.housingLoanInterest : 0
  total += state.deductions.housingRent ? DEDUCTION_STANDARDS.housingRent : 0
  total += state.deductions.elderCare ? DEDUCTION_STANDARDS.elderCare : 0
  total += state.deductions.personalPension ? DEDUCTION_STANDARDS.personalPension : 0

  return total
}

// 计算函数
function calculate() {
  const specialDeduction = calculateSpecialDeduction()

  const params = {
    monthlySalary: state.monthlySalary,
    yearEndBonus: state.yearEndBonus,
    socialWage: state.socialWage,
    specialDeduction,
    allowSalaryConversion: state.allowSalaryConversion,
    allowOptionConversion: state.allowOptionConversion,
    optionConversionRatio: state.optionConversionRatio,
    hasListedEquity: state.hasListedEquity,
    listedEquityShares: state.listedEquityShares,
    listedEquityVestPrice: state.listedEquityVestPrice,
    listedEquityStrikePrice: state.listedEquityStrikePrice,
    hasUnlistedOptions: state.hasUnlistedOptions,
    optionGrants: state.optionGrants,
    currentStockPrice: state.currentStockPrice,
    exchangeRate: state.exchangeRate
  }

  // 计算当前方案
  state.results = calculateScenario(params)

  // 生成四种方案对比
  state.scenarios = generateScenarios(params)

  // 找出最优方案
  state.bestScenario = findBestScenario(state.scenarios)
}

// 监听输入变化，自动计算（防抖）
let debounceTimer = null
watch(
  () => ({ ...state }),
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      calculate()
    }, 300)
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app-footer {
  background: #f3f4f6;
  padding: 1.5rem 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  border-top: 1px solid #e5e7eb;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 640px) {
  .app-header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .app-main {
    padding: 1rem 0.5rem;
  }
}
</style>
