<template>
  <table class="molecule-budget-table">
    <thead>
      <tr>
        <th>Kostenstelle</th>
        <th>Überschuss Vormonat</th>
        <th>{{ getMonthName(selectedMonth) }}</th>
        <th>Budget</th>
        <th>Ausgaben</th>
        <th>Saldo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Freies Budget</td>
        <td>{{ formatCurrency(calculateFreeBalancePreviousMonth()) }}</td>
        <td>{{ formatCurrency(calculateFreeRevenues()) }}</td>
        <td>{{ formatCurrency(calculateFreeBudget()) }}</td>
        <td>{{ formatCurrency(calculateFreeExpenses()) }}</td>
        <td>{{ formatCurrency(calculateFreeBalance()) }}</td>
      </tr>
      <template v-for="costCenter in costCenters" :key="costCenter.id">
        <tr :class="`${costCenter.costCenterAssets.length ? 'cost-center-has-assets' : ''} ${activeCostCenterId === costCenter.id ? 'assets-visible' : ''}`">
          <td>
            <span>{{ costCenter.name }}</span>
            <span v-if="costCenter.costCenterAssets.length" :class="`molecule-budget-table__assets-icon ${activeCostCenterId === costCenter.id ? 'molecule-budget-table__assets-icon--active' : ''}`"
                  @click="toggleAssetOverlay(costCenter.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </span>
          </td>
          <td>{{ formatCurrency(costCenter.balancePreviousMonth) }}</td>
          <td>{{ formatCurrency(costCenter.allocationBalanceCurrentMonth) }}</td>
          <td>{{ formatCurrency(costCenter.balancePreviousMonth + costCenter.allocationBalanceCurrentMonth) }}</td>
          <td>{{ formatCurrency(costCenter.expensesSum) }}</td>
          <td>{{ formatCurrency(costCenter.balance) }}</td>
        </tr>
        <tr v-if="costCenter.costCenterAssets.length" :class="getCostCenterAssetClassList(costCenter)">
          <td>
            <div>
              <span>Freies Budget</span>
            </div>
          </td>
          <td v-if="costCenter.costCenterAssets.length">
            <div>
              <span>{{ formatCurrency(getFreeBalancePreviousMonth(costCenter)) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(getAllocationBalanceFreeBudget(costCenter)) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(getFreeBudgetCurrentMonth(costCenter)) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(getExpensesSumFreeBudget(costCenter)) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(getFreeBudgetCurrentMonth(costCenter) - getExpensesSumFreeBudget(costCenter)) }}</span>
            </div>
          </td>
        </tr>
        <tr v-for="(costCenterAsset, index) in costCenter.costCenterAssets" :key="costCenterAsset.id"
            :class="getCostCenterAssetClassList(costCenter, index)">
          <td>
            <div>
              <span>{{ costCenterAsset.name }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(costCenterAsset.balancePreviousMonth) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(costCenterAsset.allocationBalanceCurrentMonth) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(costCenterAsset.balancePreviousMonth + costCenterAsset.allocationBalanceCurrentMonth) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(costCenterAsset.expensesSum) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ formatCurrency(costCenterAsset.balancePreviousMonth + costCenterAsset.allocationBalanceCurrentMonth - costCenterAsset.expensesSum) }}</span>
            </div>
          </td>
        </tr>
      </template>
      <tr class="table-row-total">
        <td>Summen</td>
        <td>{{ formatCurrency(calculateFreeBalancePreviousMonth() + costCenters.reduce((a, b) => a + b.balancePreviousMonth, 0)) }}</td>
        <td>{{ formatCurrency(calculateFreeRevenues() + costCenters.reduce((a, b) => a + b.allocationBalanceCurrentMonth, 0)) }}</td>
        <td>{{ formatCurrency(calculateFreeBudget() + costCenters.reduce((a, b) => a + (b.balancePreviousMonth + b.allocationBalanceCurrentMonth), 0))}}</td>
        <td>{{ formatCurrency(calculateFreeExpenses() + costCenters.reduce((a, b) => a + b.expensesSum, 0))}}</td>
        <td>{{ formatCurrency(calculateFreeBalance() + costCenters.reduce((a, b) => a + b.balance, 0))}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { monthService } from "@/services/month-service";
import { numberService } from "@/services/number-service";

export default {
  data() {
    return {
      activeCostCenterId: null,
    }
  },

  props: {
    bankAccount: { type: Object, required: true },
    costCenters: { type: Array, required: true },
    selectedMonth: { type: Number, required: true },
  },

  methods: {
    calculateFreeBalancePreviousMonth() {
      return this.bankAccount.balancePreviousMonth - this.costCenters.reduce((a,b) => a + b.balancePreviousMonth, 0);
    },

    calculateFreeBudget() {
      return (
          this.calculateFreeBalancePreviousMonth() +
          this.calculateFreeRevenues() +
          this.calculateFreeTransfers()
      );
    },

    calculateFreeCostCenterBudget(costCenter) {
      return costCenter.balance - costCenter.costCenterAssets.reduce((a, b) => a + b.balance, 0);
    },

    calculateFreeExpenses() {
      return this.bankAccount.expenses.reduce((a,b) => a + b.amount, 0) - this.costCenters.reduce((a,b) => a + b.expensesSum, 0);
    },

    calculateFreeRevenues() {
      return this.bankAccount.revenues.reduce((a,b) => a + b.amount, 0) - this.costCenters.reduce((a,b) => a + b.allocationBalanceCurrentMonth, 0);
    },

    calculateFreeBalance() {
      return this.calculateFreeBudget() - this.calculateFreeExpenses();
    },

    calculateFreeTransfers() {
      return 0 - this.costCenters.reduce((a,b) => a + b.transferSum, 0);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    formatDate(value) {
      return numberService.formatDate(value);
    },

    getCostCenterAssetClassList(costCenter, index = -1) {
      let classList = 'molecule-budget-table__cost-center-asset';

      classList += `${this.activeCostCenterId === costCenter.id ? ' molecule-budget-table__cost-center-asset--visible' : ''}`;
      classList += `${index === costCenter.costCenterAssets.length - 1 ? ' molecule-budget-table__cost-center-asset--last' : ''}`

      return classList;
    },

    getExpensesSumFreeBudget(costCenter) {
      //sum the expenses of every costCenterAssets in the given costCenter
      const expensesSumCostCenterAssets = costCenter.costCenterAssets.reduce((a, b) => a + b.expensesSum, 0);

      //return the difference between the costCenter expensesSum and the costCenterAsstes expensesSum
      return costCenter.expensesSum - expensesSumCostCenterAssets;
    },

    getFreeBalancePreviousMonth(costCenter) {
      const totalBalancePreviousMonth = costCenter.balancePreviousMonth;
      const costCenterAssetsPortion = costCenter.costCenterAssets.reduce((a, b) => a + b.balancePreviousMonth, 0);

      return totalBalancePreviousMonth - costCenterAssetsPortion;
    },

    getFreeBudgetCurrentMonth(costCenter) {
      return this.getFreeBalancePreviousMonth(costCenter) + this.getAllocationBalanceFreeBudget(costCenter);
    },

    getMonthName(month) {
      return monthService.getMonthName(month);
    },

    getRevenuesSum() {
      let revenuesTotal = 0;

      this.bankAccount.revenues.forEach((revenue) => {
        revenuesTotal += revenue.amount;
      });

      return numberService.formatCurrency(revenuesTotal);
    },

    getAllocationBalanceFreeBudget(costCenter) {
      //sum the allocationBalanceCurrentMonth of every costCenterAsset in the given costCenter
      const allocationSumCostCenterAssets = costCenter.costCenterAssets.reduce((a, b) => a + b.allocationBalanceCurrentMonth, 0);

      //return the difference between the costCenters allocationBalance and the sum of allocations to its costCenterAssets
      return costCenter.allocationBalanceCurrentMonth - allocationSumCostCenterAssets;
    },

    toggleAssetOverlay(costCenterId) {
      this.activeCostCenterId = this.activeCostCenterId === costCenterId ? null : costCenterId;
    }
  },
};
</script>