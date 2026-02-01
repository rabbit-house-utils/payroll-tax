<template>
  <div class="card current-breakdown">
    <h2 class="card-title">当前收入明细</h2>

    <div class="breakdown-tree">
      <!-- 总收入 -->
      <div class="tree-item level-0">
        <span class="item-label">年度总收入</span>
        <span class="item-value number">{{ formatCurrency(data.totalGrossIncome) }}</span>
      </div>

      <!-- 月工资 -->
      <div class="tree-item level-1">
        <span class="item-label">月工资 × 12</span>
        <span class="item-value number">{{ formatCurrency(data.monthlySalary * 12) }}</span>
      </div>

      <!-- 年终奖 -->
      <div class="tree-item level-1">
        <span class="item-label">年终奖</span>
        <span class="item-value number">{{ formatCurrency(data.yearEndBonus) }}</span>
      </div>

      <!-- 期权/股票 -->
      <div v-if="data.equityAmount > 0" class="tree-item level-1">
        <span class="item-label">
          {{ data.equityTax.vestingYears ? `期权（当年归属）` : '股票' }}
        </span>
        <span class="item-value number">{{ formatCurrency(data.equityAmount) }}</span>
      </div>

      <!-- 扣除项 -->
      <div class="tree-item level-0 deduction">
        <span class="item-label">扣除项合计</span>
        <span class="item-value number">
          -{{ formatCurrency(data.totalTax + data.totalInsurance) }}
        </span>
      </div>

      <!-- 五险一金 -->
      <div class="tree-item level-1 deduction">
        <span class="item-label">五险一金 × 12</span>
        <span class="item-value number">-{{ formatCurrency(data.totalInsurance) }}</span>
      </div>

      <div class="tree-item level-2 deduction-detail">
        <span class="item-label">社保（养老+医疗+失业）</span>
        <span class="item-value number">
          -{{ formatCurrency(data.insurance.socialInsurance.total * 12) }}
        </span>
      </div>

      <div class="tree-item level-2 deduction-detail">
        <span class="item-label">公积金（个人部分）</span>
        <span class="item-value number">
          -{{ formatCurrency(data.insurance.housingFund.personal * 12) }}
        </span>
      </div>

      <!-- 个人所得税 -->
      <div class="tree-item level-1 deduction">
        <span class="item-label">个人所得税</span>
        <span class="item-value number">-{{ formatCurrency(data.totalTax) }}</span>
      </div>

      <div class="tree-item level-2 deduction-detail">
        <span class="item-label">月工资税</span>
        <span class="item-value number">-{{ formatCurrency(data.salaryTax.annualTax) }}</span>
      </div>

      <div class="tree-item level-2 deduction-detail">
        <span class="item-label">年终奖税</span>
        <span class="item-value number">-{{ formatCurrency(data.bonusTax.tax) }}</span>
      </div>

      <div v-if="data.equityAmount > 0" class="tree-item level-2 deduction-detail">
        <span class="item-label">
          {{ data.equityTax.vestingYears ? `期权税（当年）` : '股票税' }}
        </span>
        <span class="item-value number">
          -{{ formatCurrency(data.equityTax.yearlyTax || data.equityTax.tax) }}
        </span>
      </div>

      <!-- 可支配收入 -->
      <div class="tree-item level-0 result">
        <span class="item-label">可支配收入（不含公积金）</span>
        <span class="item-value number highlight">{{ formatCurrency(data.disposableIncome) }}</span>
      </div>

      <!-- 含公积金收入 -->
      <div class="tree-item level-0 result">
        <span class="item-label">含公积金收入</span>
        <span class="item-value number highlight">{{ formatCurrency(data.withHousingFund) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatCurrency } from '../utils/formatter.js'

defineProps({
  data: Object
})
</script>

<style scoped>
.current-breakdown {
  margin-bottom: 2rem;
}

.tree-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.tree-item:last-child {
  border-bottom: none;
}

.level-0 {
  font-weight: 600;
  font-size: 1rem;
  padding-left: 0;
}

.level-1 {
  padding-left: 1.5rem;
  font-size: 0.9375rem;
}

.level-2 {
  padding-left: 3rem;
  font-size: 0.875rem;
}

.deduction {
  color: #dc2626;
}

.deduction-detail {
  color: #6b7280;
}

.result {
  background: #f0f9ff;
  padding: 1rem;
  margin-top: 0.5rem;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.item-label {
  flex: 1;
}

.item-value {
  font-weight: 500;
  text-align: right;
}

.highlight {
  color: #2563eb;
  font-size: 1.125rem;
}

@media (max-width: 640px) {
  .level-1 {
    padding-left: 1rem;
  }

  .level-2 {
    padding-left: 2rem;
  }

  .tree-item {
    font-size: 0.875rem;
  }

  .level-0 {
    font-size: 0.9375rem;
  }
}
</style>
