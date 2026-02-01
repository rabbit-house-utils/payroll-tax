<template>
  <div class="card optimization-advice">
    <h2 class="card-title">优化建议</h2>

    <div class="recommendation">
      <div class="recommendation-header">
        <h3>推荐方案：{{ bestScenario.name }}</h3>
        <div class="savings-badge" v-if="bestScenario.savings > 0">
          节税 {{ formatCurrency(bestScenario.savings) }}
        </div>
      </div>

      <div class="recommendation-body">
        <!-- 基础方案 -->
        <div v-if="bestScenario.key === 'scenario1'" class="advice-section">
          <p class="advice-text">
            当前收入结构已经是最优方案，无需调整。
          </p>
        </div>

        <!-- 转月工资方案 -->
        <div v-else-if="bestScenario.key === 'scenario2'" class="advice-section">
          <h4 class="advice-title">调整建议</h4>
          <ul class="advice-list">
            <li>
              将 <strong>{{ formatAmount(bestScenario.data.bonusToSalary) }}</strong>
              年终奖转为月工资发放
            </li>
            <li>
              调整后月工资：{{ formatCurrency(bestScenario.data.monthlySalary) }}
            </li>
            <li>
              调整后年终奖：{{ formatCurrency(bestScenario.data.yearEndBonus) }}
            </li>
          </ul>

          <h4 class="advice-title">收益分析</h4>
          <ul class="advice-list">
            <li>节税金额：{{ formatCurrency(bestScenario.savings) }}</li>
            <li>
              可支配收入增加：
              {{ formatCurrency(bestScenario.data.disposableIncome - baseScenario.disposableIncome) }}
            </li>
          </ul>
        </div>

        <!-- 转期权方案 -->
        <div v-else-if="bestScenario.key === 'scenario3'" class="advice-section">
          <h4 class="advice-title">调整建议</h4>
          <ul class="advice-list">
            <li>
              将 <strong>{{ formatAmount(bestScenario.data.bonusToOption) }}</strong>
              年终奖转为期权
            </li>
            <li>
              转换后期权金额：
              {{ formatCurrency(bestScenario.data.bonusToOption / optionConversionRatio) }}
              （按 {{ (optionConversionRatio * 100).toFixed(0) }}% 折扣）
            </li>
            <li>
              调整后年终奖：{{ formatCurrency(bestScenario.data.yearEndBonus) }}
            </li>
          </ul>

          <h4 class="advice-title">收益分析</h4>
          <ul class="advice-list">
            <li>节税金额：{{ formatCurrency(bestScenario.savings) }}</li>
            <li>
              可支配收入增加：
              {{ formatCurrency(bestScenario.data.disposableIncome - baseScenario.disposableIncome) }}
            </li>
            <li>
              期权（当年归属）：{{ formatCurrency(bestScenario.data.equityAmount) }}
            </li>
          </ul>
        </div>

        <!-- 注意事项 -->
        <div class="notice-section">
          <h4 class="advice-title">注意事项</h4>
          <ul class="notice-list">
            <li v-if="hasOptionConversion">
              期权具有时间价值和不确定性，转换时需考虑公司发展前景和个人风险承受能力
            </li>
            <li v-if="hasSalaryConversion">
              年终奖转月工资会影响社保和公积金缴费基数，本计算已考虑此因素
            </li>
            <li>
              以上计算基于现行税法，实际操作请咨询公司HR和税务专业人士
            </li>
            <li>
              税务优化应在合法合规的前提下进行，切勿违规操作
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 对比图表 -->
    <div class="comparison-chart">
      <h3 class="chart-title">收入对比</h3>
      <div class="chart-bars">
        <div class="chart-bar">
          <div class="bar-label">基础方案</div>
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ width: getBarWidth(baseScenario.disposableIncome) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ formatCurrency(baseScenario.disposableIncome) }}</div>
        </div>

        <div class="chart-bar best">
          <div class="bar-label">{{ bestScenario.name }}</div>
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ width: getBarWidth(bestScenario.data.disposableIncome) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ formatCurrency(bestScenario.data.disposableIncome) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { formatCurrency, formatNumber } from '../utils/formatter.js'

const props = defineProps({
  bestScenario: Object,
  baseScenario: Object,
  optionConversionRatio: {
    type: Number,
    default: 0.75
  }
})

const hasOptionConversion = computed(() => {
  return props.bestScenario.data.bonusToOption > 0
})

const hasSalaryConversion = computed(() => {
  return props.bestScenario.data.bonusToSalary > 0
})

function formatAmount(amount) {
  if (!amount || amount === 0) return '0'
  return '¥' + formatNumber(amount, 0)
}

function getBarWidth(value) {
  const maxValue = Math.max(
    props.baseScenario.disposableIncome,
    props.bestScenario.data.disposableIncome
  )
  return (value / maxValue) * 100
}
</script>

<style scoped>
.optimization-advice {
  margin-bottom: 2rem;
}

.recommendation {
  margin-bottom: 2rem;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.recommendation-header h3 {
  font-size: 1.25rem;
  color: #111827;
}

.savings-badge {
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9375rem;
}

.recommendation-body {
  line-height: 1.8;
}

.advice-section {
  margin-bottom: 2rem;
}

.advice-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.advice-text {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

.advice-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #374151;
  font-size: 0.9375rem;
}

.advice-list li {
  margin-bottom: 0.5rem;
}

.advice-list strong {
  color: #2563eb;
  font-weight: 600;
}

.notice-section {
  background: #fef3c7;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.notice-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #92400e;
  font-size: 0.875rem;
}

.notice-list li {
  margin-bottom: 0.5rem;
}

.comparison-chart {
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #374151;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-bar {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1rem;
  align-items: center;
}

.chart-bar.best .bar-label {
  font-weight: 600;
  color: #10b981;
}

.bar-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.bar-container {
  height: 32px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.5s ease;
}

.chart-bar.best .bar-fill {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.bar-value {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  min-width: 120px;
  text-align: right;
}

@media (max-width: 640px) {
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chart-bar {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .bar-value {
    text-align: left;
  }
}
</style>
