<template>
  <div class="card input-form">
    <h2 class="card-title">收入信息</h2>

    <!-- 基本信息 -->
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">月工资（元）</label>
        <input
          type="number"
          class="form-input"
          :value="monthlySalary"
          @input="$emit('update:monthlySalary', Number($event.target.value))"
          min="0"
          step="1000"
        />
      </div>

      <div class="form-group">
        <label class="form-label">年终奖（元）</label>
        <input
          type="number"
          class="form-input"
          :value="yearEndBonus"
          @input="$emit('update:yearEndBonus', Number($event.target.value))"
          min="0"
          step="10000"
        />
      </div>

      <div class="form-group">
        <label class="form-label">社平工资（元/月）</label>
        <input
          type="number"
          class="form-input"
          :value="socialWage"
          @input="$emit('update:socialWage', Number($event.target.value))"
          min="0"
          step="100"
        />
      </div>
    </div>

    <!-- 专项附加扣除 -->
    <div class="form-section">
      <h3 class="section-title">专项附加扣除</h3>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            class="form-checkbox"
            :checked="useCustomDeduction"
            @change="$emit('update:useCustomDeduction', $event.target.checked)"
          />
          使用自定义扣除额
        </label>
      </div>

      <div v-if="useCustomDeduction" class="form-group">
        <label class="form-label">每月扣除总额（元）</label>
        <input
          type="number"
          class="form-input"
          :value="deductions.customAmount"
          @input="updateDeduction('customAmount', Number($event.target.value))"
          min="0"
          step="100"
        />
      </div>

      <div v-else class="deduction-items">
        <div class="form-group">
          <label class="form-label">子女教育或婴幼儿照护（2000元/月/人）</label>
          <input
            type="number"
            class="form-input"
            :value="deductions.childEducation"
            @input="updateDeduction('childEducation', Number($event.target.value))"
            min="0"
            max="10"
            placeholder="人数"
          />
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              class="form-checkbox"
              :checked="deductions.housingLoanInterest"
              @change="updateDeduction('housingLoanInterest', $event.target.checked)"
              :disabled="deductions.housingRent"
            />
            住房贷款利息（1000元/月）
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              class="form-checkbox"
              :checked="deductions.housingRent"
              @change="updateDeduction('housingRent', $event.target.checked)"
              :disabled="deductions.housingLoanInterest"
            />
            住房租金（1500元/月）
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              class="form-checkbox"
              :checked="deductions.elderCare"
              @change="updateDeduction('elderCare', $event.target.checked)"
            />
            赡养老人（3000元/月）
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              class="form-checkbox"
              :checked="deductions.personalPension"
              @change="updateDeduction('personalPension', $event.target.checked)"
            />
            个人养老金（1000元/月）
          </label>
        </div>

        <p class="deduction-note">注：住房贷款利息和住房租金不能同时享受</p>
      </div>
    </div>

    <!-- 年终奖转换选项 -->
    <div class="form-section">
      <h3 class="section-title">年终奖转换选项</h3>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            class="form-checkbox"
            :checked="allowSalaryConversion"
            @change="$emit('update:allowSalaryConversion', $event.target.checked)"
            :disabled="allowOptionConversion"
          />
          允许年终奖转月工资
        </label>
      </div>

      <div v-if="hasUnlistedOptions" class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            class="form-checkbox"
            :checked="allowOptionConversion"
            @change="$emit('update:allowOptionConversion', $event.target.checked)"
            :disabled="allowSalaryConversion"
          />
          允许年终奖转期权
        </label>
      </div>

      <p class="deduction-note">注：转月工资和转期权不能同时选择</p>

      <div v-if="allowOptionConversion" class="form-group">
        <label class="form-label">
          期权转换比例：{{ (optionConversionRatio * 100).toFixed(0) }}%
        </label>
        <input
          type="range"
          class="form-range"
          :value="optionConversionRatio"
          @input="$emit('update:optionConversionRatio', Number($event.target.value))"
          min="0.5"
          max="1.0"
          step="0.01"
        />
        <div class="range-labels">
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>

    <!-- 股票/期权收入 -->
    <div class="form-section">
      <h3 class="section-title">股票/期权收入</h3>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            class="form-checkbox"
            :checked="hasListedEquity"
            @change="$emit('update:hasListedEquity', $event.target.checked)"
          />
          股票或已上市公司期权
        </label>
      </div>

      <div v-if="hasListedEquity" class="equity-inputs">
        <div class="form-group">
          <label class="form-label">股数</label>
          <input
            type="number"
            class="form-input"
            :value="listedEquityShares"
            @input="$emit('update:listedEquityShares', Number($event.target.value))"
            min="0"
            placeholder="当年归属股数"
          />
        </div>

        <div class="form-group">
          <label class="form-label">归属股价（美元）</label>
          <input
            type="number"
            class="form-input"
            :value="listedEquityVestPrice"
            @input="$emit('update:listedEquityVestPrice', Number($event.target.value))"
            min="0"
            step="0.01"
            placeholder="当年归属时的股价"
          />
        </div>

        <div class="form-group">
          <label class="form-label">行权价（美元）</label>
          <input
            type="number"
            class="form-input"
            :value="listedEquityStrikePrice"
            @input="$emit('update:listedEquityStrikePrice', Number($event.target.value))"
            min="0"
            step="0.01"
            placeholder="RSU为0，Option不为0"
          />
        </div>

        <div class="form-group">
          <label class="form-label">汇率（美元/人民币）</label>
          <input
            type="number"
            class="form-input"
            :value="exchangeRate"
            @input="$emit('update:exchangeRate', Number($event.target.value))"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            class="form-checkbox"
            :checked="hasUnlistedOptions"
            @change="$emit('update:hasUnlistedOptions', $event.target.checked)"
          />
          未上市公司期权
        </label>
      </div>

      <div v-if="hasUnlistedOptions" class="equity-inputs">
        <div class="form-group">
          <label class="form-label">当前股价（美元）</label>
          <input
            type="number"
            class="form-input"
            :value="currentStockPrice"
            @input="$emit('update:currentStockPrice', Number($event.target.value))"
            min="0"
            step="0.01"
          />
        </div>

        <div class="form-group">
          <label class="form-label">汇率（美元/人民币）</label>
          <input
            type="number"
            class="form-input"
            :value="exchangeRate"
            @input="$emit('update:exchangeRate', Number($event.target.value))"
            min="0"
            step="0.01"
          />
        </div>

        <div class="form-group">
          <label class="form-label">期权授予列表</label>
          <div
            v-for="(grant, index) in optionGrants"
            :key="index"
            class="grant-item"
          >
            <div class="grant-header">
              <span class="grant-title">授予 {{ index + 1 }}</span>
              <button
                v-if="optionGrants.length > 1"
                class="btn btn-secondary btn-small"
                @click="removeGrant(index)"
              >
                删除
              </button>
            </div>

            <div class="grant-fields">
              <div class="form-group-inline">
                <label class="form-label-small">总股数</label>
                <input
                  type="number"
                  class="form-input-small"
                  :value="grant.totalShares"
                  @input="updateGrant(index, 'totalShares', Number($event.target.value))"
                  min="0"
                  placeholder="股数"
                />
              </div>

              <div class="form-group-inline">
                <label class="form-label-small">行权价（美元）</label>
                <input
                  type="number"
                  class="form-input-small"
                  :value="grant.strikePrice"
                  @input="updateGrant(index, 'strikePrice', Number($event.target.value))"
                  min="0"
                  step="0.01"
                  placeholder="行权价"
                />
              </div>

              <div class="form-group-inline">
                <label class="form-label-small">归属年数</label>
                <input
                  type="number"
                  class="form-input-small"
                  :value="grant.totalYears"
                  @input="updateGrant(index, 'totalYears', Number($event.target.value))"
                  min="1"
                  max="10"
                  placeholder="年数"
                />
              </div>

              <div class="form-group-inline">
                <label class="form-label-small">已归属年数</label>
                <input
                  type="number"
                  class="form-input-small"
                  :value="grant.vestedYears"
                  @input="updateGrant(index, 'vestedYears', Number($event.target.value))"
                  min="0"
                  :max="grant.totalYears"
                  placeholder="已归属"
                />
              </div>
            </div>
          </div>
          <button class="btn btn-secondary btn-small" @click="addGrant">
            添加授予
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, watch } from 'vue'

const props = defineProps({
  monthlySalary: Number,
  yearEndBonus: Number,
  socialWage: Number,
  deductions: Object,
  useCustomDeduction: Boolean,
  allowSalaryConversion: Boolean,
  allowOptionConversion: Boolean,
  optionConversionRatio: Number,
  hasListedEquity: Boolean,
  listedEquityShares: Number,
  listedEquityVestPrice: Number,
  listedEquityStrikePrice: Number,
  hasUnlistedOptions: Boolean,
  optionGrants: Array,
  currentStockPrice: Number,
  exchangeRate: Number
})

const emit = defineEmits([
  'update:monthlySalary',
  'update:yearEndBonus',
  'update:socialWage',
  'update:deductions',
  'update:useCustomDeduction',
  'update:allowSalaryConversion',
  'update:allowOptionConversion',
  'update:optionConversionRatio',
  'update:hasListedEquity',
  'update:listedEquityShares',
  'update:listedEquityVestPrice',
  'update:listedEquityStrikePrice',
  'update:hasUnlistedOptions',
  'update:optionGrants',
  'update:currentStockPrice',
  'update:exchangeRate'
])

// 判断是否有未上市公司期权
const hasUnlistedOptionsValue = computed(() => {
  if (!props.hasUnlistedOptions) return false
  if (!props.optionGrants || props.optionGrants.length === 0) return false
  return props.optionGrants.some(grant => grant.totalShares > 0)
})

// 当没有未上市公司期权时，自动关闭年终奖转期权选项
watch(hasUnlistedOptionsValue, (newValue) => {
  if (!newValue && props.allowOptionConversion) {
    emit('update:allowOptionConversion', false)
  }
})

function updateDeduction(key, value) {
  emit('update:deductions', {
    ...props.deductions,
    [key]: value
  })
}

function updateGrant(index, key, value) {
  const newGrants = [...props.optionGrants]
  const grant = newGrants[index]

  // 更新字段
  newGrants[index] = {
    ...grant,
    [key]: value
  }

  emit('update:optionGrants', newGrants)
}

function addGrant() {
  emit('update:optionGrants', [
    ...props.optionGrants,
    {
      totalShares: 0,
      strikePrice: 0,
      totalYears: 4,
      vestedYears: 0
    }
  ])
}

function removeGrant(index) {
  const newGrants = props.optionGrants.filter((_, i) => i !== index)
  emit('update:optionGrants', newGrants)
}
</script>

<style scoped>
.input-form {
  margin-bottom: 2rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.deduction-items {
  padding-left: 0.5rem;
}

.deduction-note {
  font-size: 0.8125rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.5rem;
}

.equity-inputs {
  padding-left: 1.5rem;
  margin-top: 1rem;
  border-left: 2px solid #e5e7eb;
}

.form-range {
  width: 100%;
  margin: 0.5rem 0;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #6b7280;
}

.vesting-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.vesting-item .form-input {
  flex: 1;
}

.vesting-label {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.grant-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
}

.grant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.grant-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.9375rem;
}

.grant-fields {
  display: grid;
  gap: 0.75rem;
}

.form-group-inline {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label-small {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #4b5563;
}

.form-input-small {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-select-small {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.schedule-custom {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .vesting-item {
    flex-wrap: wrap;
  }

  .vesting-item .form-input {
    min-width: 120px;
  }
}
</style>
