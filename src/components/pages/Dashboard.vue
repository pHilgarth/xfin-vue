<template>
  <div class="dashboard">
    <AtomHeadline tag="h1" text="Dashboard" />

<div style="padding: 20px 40px; margin:20px; border:1px solid red;">
  <h1>Next Steps</h1>

  <h4>Prüfen, ob noch relevant:</h4>
  <ul>
    <li>CostCenterAssetTransactions implementieren => CostCenterAssetOverlay als großes Modal implementieren, ggf. auch mit MonthSwitch</li>
    <li>OrganismTransactionForm wiederverwendbar machen -> wird auch benötigt um neue RecurringRevenues / RecurringExpenses zu erstellen -> die Form ist hier die gleiche, nur dass eben noch die Felder für Recurring hinzukommen<br>&nbsp;&nbsp;&nbsp;->MoleculeTransactionType ist neu, muss noch gestylt werden, dann getestet</li>
    <li>RecurringTransaction im Overheads und dann auch auf RecurringRevenues / mit Start- und Enddatum /</li>
  </ul>
</div>

    <OrganismTransactionsDue />
  </div>
</template>
<script>

import AtomHeadline from '@/components/atoms/AtomHeadline';
import OrganismTransactionsDue from '@/components/organisms/OrganismTransactionsDue';

export default {
  components: {
    AtomHeadline,
    OrganismTransactionsDue,
  },
}
</script>