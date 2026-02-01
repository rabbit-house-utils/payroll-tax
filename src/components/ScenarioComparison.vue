<template>
  <div class="card scenario-comparison">
    <h2 class="card-title">方案对比</h2>

    <div class="table-wrapper">
      <table class="table comparison-table">
        <thead>
          <tr>
            <th>项目</th>
            <th v-for="scenario in enabledScenarios" :key="scenario.key">
              {{ scenario.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 收入构成 -->
          <tr>
            <td class="row-header">月工资</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              {{ formatCurrency(scenario.data.monthlySalary) }}
            </td>
          </tr>

          <tr>
            <td class="row-header">年终奖</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              {{ formatCurrency(scenario.data.yearEndBonus) }}
            </td>
          </tr>

          <tr v-if="hasEquity">
            <td class="row-header">期权/股票</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              {{ formatCurrency(scenario.data.equityAmount) }}
            </td>
          </tr>

          <!-- 转换金额 -->
          <tr v-if="allowSalaryConversion" class="conversion-row">
            <td class="row-header">年终奖转月工资</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number conversion-amount">
              {{ formatAmount(scenario.data.bonusToSalary) }}
            </td>
          </tr>

          <tr v-if="allowOptionConversion" class="conversion-row">
            <td class="row-header">年终奖转期权</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number conversion-amount">
              {{ formatAmount(scenario.data.bonusToOption) }}
            </td>
          </tr>

          <!-- 税务汇总 -->
          <tr class="divider-row">
            <td :colspan="enabledScenarios.length + 1"></td>
          </tr>

          <tr>
            <td class="row-header">总税额</td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              {{ formatCurrency(scenario.data.totalTax) }}
            </td>
          </tr>

          <tr class="highlight-row">
            <td class="row-header"><strong>可支配收入</strong></td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              <strong>{{ formatCurrency(scenario.data.disposableIncome) }}</strong>
            </td>
          </tr>

          <tr class="highlight-row">
            <td class="row-header"><strong>含公积金收入</strong></td>
            <td v-for="scenario in enabledScenarios" :key="scenario.key"
                :class="getCellClass(scenario.key)" class="number">
              <strong>{{ formatCurrency(scenario.data.withHousingFund) }}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="best-scenario-note">
      <p>
        <strong>最优方案：</strong>{{ bestScenario.name }}
        <span v-if="bestScenario.savings > 0">
          （节税 {{ formatCurrency(bestScenario.savings) }}）
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { formatCurrency, formatNumber } from '../utils/formatter.js'

const props = defineProps({
  scenarios: Object,
  bestScenario: Object,
  allowSalaryConversion: Boolean,
  allowOptionConversion: Boolean
})

const hasEquity = computed(() => {
  return Object.values(props.scenarios).some(s => s.equityAmount > 0)
})

// 根据启用的转换选项计算应该显示的方案
const enabledScenarios = computed(() => {
  const scenarios = []

  // 基础方案始终显示
  scenarios.push({
    key: 'scenario1',
    name: '基础方案',
    data: props.scenarios.scenario1
  })

  // 转月工资方案
  if (props.allowSalaryConversion) {
    scenarios.push({
      key: 'scenario2',
      name: '转月工资',
      data: props.scenarios.scenario2
    })
  }

  // 转期权方案
  if (props.allowOptionConversion) {
    scenarios.push({
      key: 'scenario3',
      name: '转期权',
      data: props.scenarios.scenario3
    })
  }

  return scenarios
})

function getCellClass(scenarioKey) {
  if (props.bestScenario.key === scenarioKey) {
    return 'best-scenario'
  }
  return ''
}

function formatAmount(amount) {
  if (!amount || amount === 0) return '-'
  return '¥' + formatNumber(amount, 0)
}
</script>

<style scoped>
.scenario-comparison {
  margin-bottom: 2rem;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.comparison-table {
  min-width: 600px;
}

.comparison-table th {
  text-align: center;
  white-space: nowrap;
}

.comparison-table td {
  text-align: center;
}

.row-header {
  text-align: left !important;
  font-weight: 500;
  white-space: nowrap;
}

.conversion-row {
  background: #fef3c7;
}

.conversion-amount {
  color: #92400e;
  font-weight: 500;
}

.divider-row td {
  padding: 0.25rem;
  border-bottom: 2px solid #e5e7eb;
}

.highlight-row {
  background: #f0f9ff;
}

.best-scenario {
  background: #d1fae5 !important;
  font-weight: 600;
}

.best-scenario-note {
  padding: 1rem;
  background: #d1fae5;
  border-radius: 6px;
  border: 1px solid #10b981;
}

.best-scenario-note p {
  margin: 0;
  color: #065f46;
  font-size: 0.9375rem;
}

.best-scenario-note strong {
  font-weight: 600;
}

@media (max-width: 640px) {
  .comparison-table {
    font-size: 0.8125rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.5rem 0.25rem;
  }
}
</style>
