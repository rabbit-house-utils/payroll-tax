// 税率表和常量定义

// 月工资税率表（累进税率）
export const MONTHLY_TAX_TABLE = [
  { limit: 36000, rate: 0.03, quickDeduction: 0 },
  { limit: 144000, rate: 0.10, quickDeduction: 2520 },
  { limit: 300000, rate: 0.20, quickDeduction: 16920 },
  { limit: 420000, rate: 0.25, quickDeduction: 31920 },
  { limit: 660000, rate: 0.30, quickDeduction: 52920 },
  { limit: 960000, rate: 0.35, quickDeduction: 85920 },
  { limit: Infinity, rate: 0.45, quickDeduction: 181920 }
]

// 年终奖税率表（速算扣除数不同）
export const BONUS_TAX_TABLE = [
  { limit: 36000, rate: 0.03, quickDeduction: 0 },
  { limit: 144000, rate: 0.10, quickDeduction: 210 },
  { limit: 300000, rate: 0.20, quickDeduction: 1410 },
  { limit: 420000, rate: 0.25, quickDeduction: 2660 },
  { limit: 660000, rate: 0.30, quickDeduction: 4410 },
  { limit: 960000, rate: 0.35, quickDeduction: 7160 },
  { limit: Infinity, rate: 0.45, quickDeduction: 15160 }
]

// 社保缴费比例
export const SOCIAL_INSURANCE_RATES = {
  pension: 0.08,      // 养老保险 8%
  medical: 0.02,      // 医疗保险 2%
  unemployment: 0.005 // 失业保险 0.5%
}

// 社保总缴费比例
export const TOTAL_SOCIAL_INSURANCE_RATE = 0.105 // 10.5%

// 公积金缴费比例
export const HOUSING_FUND_RATE = 0.12 // 个人12%
export const HOUSING_FUND_TOTAL_RATE = 0.24 // 双边24%

// 缴费基数限制
export const BASE_SALARY_MIN_RATIO = 0.6  // 社平工资的60%
export const BASE_SALARY_MAX_RATIO = 3.0  // 社平工资的300%

// 默认社平工资
export const DEFAULT_SOCIAL_WAGE = 11937

// 个税起征点
export const TAX_THRESHOLD = 5000

// 专项附加扣除标准
export const DEDUCTION_STANDARDS = {
  childEducation: 2000,      // 子女教育或婴幼儿照护 2000元/月/人
  housingLoanInterest: 1000, // 住房贷款利息 1000元/月
  housingRent: 1500,         // 住房租金 1500元/月
  elderCare: 3000,           // 赡养老人 3000元/月
  personalPension: 1000      // 个人养老金 1000元/月
}
