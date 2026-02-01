<template>
  <div class="result-tabs">
    <div class="tabs">
      <ul class="tab-list">
        <li>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'current' }"
            @click="activeTab = 'current'"
          >
            当前收入明细
          </button>
        </li>
        <li v-if="showScenarioComparison">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'scenarios' }"
            @click="activeTab = 'scenarios'"
          >
            方案对比
          </button>
        </li>
      </ul>
    </div>

    <div class="tab-content">
      <CurrentBreakdown v-if="activeTab === 'current'" :data="current" />
      <ScenarioComparison
        v-if="activeTab === 'scenarios' && showScenarioComparison"
        :scenarios="scenarios"
        :bestScenario="bestScenario"
        :allowSalaryConversion="allowSalaryConversion"
        :allowOptionConversion="allowOptionConversion"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import CurrentBreakdown from './CurrentBreakdown.vue'
import ScenarioComparison from './ScenarioComparison.vue'

const props = defineProps({
  current: Object,
  scenarios: Object,
  bestScenario: Object,
  allowSalaryConversion: Boolean,
  allowOptionConversion: Boolean,
  optionConversionRatio: Number
})

const activeTab = ref('current')

// 只有当至少有一个转换选项被启用时才显示方案对比
const showScenarioComparison = computed(() => {
  return props.allowSalaryConversion || props.allowOptionConversion
})
</script>

<style scoped>
.result-tabs {
  margin-top: 2rem;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
