<template>
  <OrganismCollapsible class="organism-expenses" :config="configureCollapsible()" />
</template>

<script>
import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';

import { numberService } from "@/services/number-service";

export default {
  components: {
    OrganismCollapsible,
  },

  props: {
      bankAccount: {
          type: Object,
          required: true,
      },
  },

  methods: {
    configureCollapsible() {
      return {
        collapsed: true,
        title: "Ausgaben",
        content: [
          {
            component: {
              tag: "OrganismTable",
              props: {
                config: this.configureTable(),
              },
            }
          }
        ],
      };
    },

    configureTable() {
      let rows = [];

      this.bankAccount.expenses.forEach((expense) => {
        const row = {
          fields: [
            { content: numberService.formatDate(expense.date) },
            { content: expense.costCenterName },
            { content: expense.counterParty },
            { content: expense.reference },
            {
              content: numberService.formatCurrency(Math.abs(expense.amount)),
              props: { class: 'align-right' },
            },
          ],
        };

        rows.push(row);
      });

      if (this.bankAccount.expenses.length === 0) {
        rows.push({
          fields: [
            {
              content: "Keine Ausgaben vorhanden!",
              props: {
                colspan: 4,
                class: "text-center",
              },
            },
          ],
        });
      }

      rows.push({
        fields: [
          {
            content: "Ausgaben gesamt",
            props: { colspan: 4 },
          },
          {
            content: this.getExpensesSum(true),
            props: { class: 'align-right' },
          },
        ],
        props: {
              class: "total",
        },
      });

      return {
        tableHead: {
          fields: [
            { content: "Datum" },
            { content: "Kostenstelle" },
            { content: "Zahlungsempfänger" },
            { content: "Verwendungszweck" },
            {
              content: "Betrag",
              props: { class: 'align-right' },
            },
          ],
        },
        tableBody: {
          rows: rows,
        },
      };
    },

    getExpensesSum() {
      let expensesTotal = 0;

      this.bankAccount.expenses.forEach(expense => {
        expensesTotal += expense.amount;
      });
      
      return numberService.formatCurrency(Math.abs(expensesTotal));
    },
  },
};
</script>