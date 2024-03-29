<template>
  <form class="organism-transaction-form">
    <div class="organism-transaction-form__payer">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zahlungspflichtiger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payer-account" v-model="payerAccount" label="Konto" :required="payerRequired" :items="payerAccounts"
                                  :allowNewItems="allowNewPayer" :validation="v$.payerAccount" :hasErrors="v$.payerAccount?.$error"
                                  @itemPicked="pickItem($event, 'payerAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayerAccount"/>
      </div>

      <div v-if="transactionType === 'Expense'" class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payer-cost-center" v-model="payerCostCenter" label="Kostenstelle" :items="payerCostCenters"
                                  :disabled="payerAccount?.external" :validation="v$.payerCostCenter"
                                  :hasErrors="v$.payerCostCenter?.$error" @itemPicked="pickItem($event, 'payerCostCenter')"
                                  @blur="onBlurPayerCostCenter" />

        <MoleculeLoading v-if="payerAccount && payerCostCenter && !payerCostCenterAssetsLoaded"
                         :loadingError="payerCostCenterAssetsLoadingError" errorMessage="Fehler beim Laden der Daten!" />

        <MoleculeInputAutoSuggest v-else-if="payerCostCenterAssetsLoaded" field="payer-cost-center-asset" class="mt-5" label="Posten auf Kostenstelle"
                                  v-model="payerCostCenterAsset" :items="payerCostCenterAssets" @itemPicked="pickItem($event, 'payerCostCenterAsset')"
                                  @blur="onBlurPayerCostCenterAsset" />
      </div>

    </div>

    <div class="organism-transaction-form__payee">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zahlungsempfänger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payee-account" v-model="payeeAccount" label="Konto" :required="payeeRequired" :items="payeeAccounts"
                                  :allowNewItems="allowNewPayee" :validation="v$.payeeAccount" :hasErrors="v$.payeeAccount?.$error"
                                  @itemPicked="pickItem($event, 'payeeAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayeeAccount" />

      </div>
    </div>

    <div class="organism-transaction-form__details">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Details" />

      <div class="col-md-6 pb-5 pe-3">
        <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" :required="true" :hasErrors="v$.reference.$error"
                           :validation="v$.reference" @blur="v$.reference.$touch()" />
      </div>
      <div class="col-md-6 pb-5 ps-3">
        <MoleculeInputText field="amount" v-model="amount" label="Betrag" :required="true" :hasErrors="v$.amount.$error"
                           :validation="v$.amount" @blur="v$.amount.$touch()"/>

      </div>
      <div class="col-md-6 pb-5 ps-3">
        <MoleculeInputCheckbox class="col-md-12 pb-3" v-model="isCashTransaction" label="Bargeld-Transaktion" />
      </div>
    </div>

    <div class="organism-transaction-form__options">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zusätzliche Optionen" />

      <div class="col-md-6 pb-5">
        <MoleculeInputAutoSuggest field="loan" label="Darlehen" noItemsLabel="" v-model="loan" :items="loans"
                                  @itemPicked="pickItem($event, 'loan')" />
      </div>

    </div>

    <div class="organism-transaction-form__date-of-booking">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h5" text="Datum der Verbuchung" />
      <Datepicker class="vuepic-datepicker pb-5 w-25" v-model="bookingDate" format="dd.MM.Y" placeholder="Zieldatum" locale="de" :maxDate="new Date()" :enableTimePicker="false" autoApply />
    </div>

    <AtomButton :disabled="v$.$invalid || pendingTransaction" type="primary" text="Speichern" @click.prevent="saveTransaction" />

  </form>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox from "../molecules/MoleculeInputCheckbox";
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from "@/components/molecules/MoleculeLoading";

import { copyService } from '@/services/copy-service';
import { costCenterAssetService } from "@/services/cost-center-asset-service";
import { loanService } from '@/services/loan-service';
import { numberService } from '@/services/number-service';

import { transactionValidation } from '@/validation/validations';

//third party imports
import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";


export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputText,
    MoleculeLoading,
    Datepicker,
  },

  computed: {
    allowNewPayee() {
      return this.transactionType === 'Expense';
    },

    allowNewPayer() {
      return this.transactionType === 'Revenue'
    },

    payeeRequired() {
      return this.transactionType === "Transfer" || !this.isCashTransaction || this.transactionType === "Revenue";
    },

    payerRequired() {
      return this.transactionType === "Transfer" || !this.isCashTransaction || this.transactionType === "Expense";
    }
  },

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
    }
  },

  data() {
    return {
      amount: null,
      bookingDate: null,
      dataLoaded: false,
      fullLoans: null,
      isCashTransaction: false,
      loadingError: false,
      loan: null,
      loans: [],
      payeeAccount: this.initialPayeeAccount || null,
      payeeCostCenter: this.initialPayeeCostCenter || null,
      payeeCostCenters: copyService.copyArray(this.costCenters),
      payeeCostCenterAsset: null,
      payeeCostCenterAssets: null,
      payeeCostCenterAssetsLoaded: false,
      payeeCostCenterAssetsLoadingError: false,
      payeeReserves: null,
      payerAccount: this.initialPayerAccount || null,
      payerCostCenter: this.initialPayerCostCenter || null,
      payerCostCenters: copyService.copyArray(this.costCenters),
      payerCostCenterAsset: null,
      payerCostCenterAssets: null,
      payerCostCenterAssetsLoaded: false,
      payerCostCenterAssetsLoadingError: false,
      payerReserves: null,
      reference: null,
      transactionTypes: [
        {id: 'Revenue', label: 'Einnahme'},
        {id: 'Expense', label: 'Ausgabe'},
        {id: 'Transfer', label: 'Umbuchung'}
      ],
    }
  },

  props: {
    costCenters: { type: Array, required: true },
    initialPayeeAccount: { type: Object },
    initialPayerAccount: { type: Object },
    payeeAccounts: { type: Array, required: true},
    payerAccounts: { type: Array, required: true },
    pendingTransaction: { type: Boolean },
    transactionType: { type: String, required: true },
  },

  methods: {
    async getData() {

    },

    async fetchLoans() {
      if (this.payeeAccount && this.payerAccount) {
        try {
          const loans = await loanService.getAllByCreditorAndDebitor(this.payerAccount.id, this.payeeAccount.id);

          this.fullLoans = loans;
          this.loans = loans.map(l => { return { id: l.id, label: l.reference} });
        }
        catch (error) {
          console.error(error);
        }
      }
    },

    async fetchPayeeCostCenterAssets() {
      try {
        const payeeCostCenterAssets = await costCenterAssetService.getAllByAccountAndCostCenter(this.payeeAccount.id, this.payeeCostCenter.id);

        this.payeeCostCenterAssets = Array.from(payeeCostCenterAssets.map(p => {
          console.log(p);
          return {
            id: p.id,
            label: p.name + `${p.isReserve ? ' (Rücklage)' : ''}`,
            amount: p.amount
          }
        })).flat();

        this.payeeCostCenterAssetsLoaded = true;
      } catch (error) {
        console.error(`Error fetching costCenterAssets (${error})`);
        this.payeeCostCenterAssetsLoadingError = true;
      }
    },

    async fetchPayerCostCenterAssets() {
      try {
        const payerCostCenterAssets = await costCenterAssetService.getAllByAccountAndCostCenter(this.payerAccount.id, this.payerCostCenter.id);

        this.payerCostCenterAssets = Array.from(payerCostCenterAssets.map(p => {
          return {
            id: p.id,
            label: `${p.name}${p.isReserve ? ' (Rücklage)' : ''}`,
            amount: p.amount
          }
        })).flat();

        this.payerCostCenterAssetsLoaded = true;
      } catch (error) {
        console.log(`Error fetching costCenterAssets (${error})`);
        this.payerCostCenterAssetsLoadingError = true;
      }
    },

    onBlurPayeeAccount(event) {
      if (this.payeeAccount?.label !== event.target.value) {
        this.payeeAccount = null;
      }

      this.v$.payeeAccount?.$touch();
    },

    onBlurPayeeCostCenter(event) {
      if (this.payeeCostCenter?.label !== event.target.value) {
        this.payeeCostCenter = null;
      }

      this.v$.payeeCostCenter?.$touch();
    },

    onBlurPayeeCostCenterAsset(event) {
      if (this.payeeCostCenterAsset?.label !== event.target.value) {
        this.payeeCostCenterAsset = null;
      }
    },

    onBlurPayerAccount(event) {
      if (this.payerAccount?.label !== event.target.value) {
        this.payerAccount = null;
      }

      this.v$.payerAccount?.$touch();
    },

    onBlurPayerCostCenter(event) {
      if (this.payerCostCenter?.label !== event.target.value) {
        this.payerCostCenter = null;
      }

      this.v$.payerCostCenter?.$touch();
    },

    onBlurPayerCostCenterAsset(event) {
      if (this.payerCostCenterAsset?.label !== event.target.value) {
        this.payerCostCenterAsset = null;
      }
    },

    pickItem(id, property, findIn) {
      //TODO - this is not good.... this way every property must have a pendant with an additional s at the end... that's a stupid dependency
      this[property] = this[`${findIn || property + 's'}`].find(p => p.id == id);
    },

    saveTransaction() {
      this.v$.$touch();

      if (!this.v$.$error) {
        //TODO - ugly... refactoring? look these ternaries....
        const newTransaction = {
          sourceBankAccountId: this.payerAccount?.id,
          targetBankAccountId: this.payeeAccount?.id,
          costCenterId: this.payerCostCenter?.id,
          costCenterAssetId: this.payerCostCenterAsset?.id,
          //TODO - einmalig geplante transactions einführen! (Datum auswählen, wann verbucht werden soll) Muss dann auch auf der Startseite bestätigt werden
          dueDateString: this.bookingDate?.toISOString() || new Date().toISOString(),
          dateString: this.bookingDate?.toISOString() || new Date().toISOString(),
          reserve: this.payerCostCenterAsset?.isReserve
              ? this.payerCostCenterAsset
              : this.payeeCostCenterAsset?.isReserve
                  ? this.payeeCostCenterAsset
                  : null,
          loan: this.fullLoans ? this.fullLoans.find(l => l.id === this.loan?.id) : null,
          loanId: this.loan?.id,
          reference: this.reference,
          amount: numberService.parseFloat(this.amount),
          //TODO - in TransactionForm / TransactionManager it's no longer possible to have the same account for payer and payee (no account-internal transfers)
          //TODO - review this ternary carefully and delete it, if not needed
          transactionType: this.payeeAccount?.id === this.payerAccount?.id
            ? "Transfer"
            : this.transactionType,
          executed: true,
          isCashTransaction: this.isCashTransaction,
        };

        //TODO - i need to change this, that's not good
        if (newTransaction.sourceCostCenterAsset || newTransaction.targetCostCenterAsset) {
          newTransaction.updateCostCenterAssets = true;
        }

        this.$emit('saveTransaction', newTransaction);
      }
    },

    updateCostCenterAssets() {
      this.payeeCostCenterAsset = null;
      //TODO - why resetting only payeeCostCenterAsset and not payerCostCenterAsset?

      if (this.transactionType === 'Expense') {
        this.updatePayerCostCenterAssets();
      }
      else if (this.transactionType === 'Revenue') {
        this.updatePayeeCostCenterAssets();
      }
      else if (this.transactionType === 'Transfer') {
        this.updatePayerCostCenterAssets();
        this.updatePayeeCostCenterAssets();
      }
    },

    updatePayeeCostCenterAssets() {
      if (this.payeeAccount && this.payeeCostCenter) {
        this.fetchPayeeCostCenterAssets();
      }
      else {
        this.payeeCostCenterAssetsLoaded = false;
      }
    },

    updatePayerCostCenterAssets() {
      if (this.payerAccount && this.payerCostCenter) {
        this.fetchPayerCostCenterAssets();
      }
      else {
        this.payerCostCenterAssetsLoaded = false;
      }
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    const validation = copyService.copyObject(transactionValidation);

    if (this.transactionType === "Transfer" || !this.isCashTransaction) {
      validation.payerAccount = { required };
      validation.payeeAccount = { required };
    }
    else if (this.transactionType === "Revenue") {
      validation.payeeAccount = { required };
    }
    else if (this.transactionType === "Expense") {
      validation.payerAccount = { required };
    }

    return validation;
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    initialPayeeAccount() {
      this.payeeAccount = this.initialPayeeAccount;
    },

    initialPayeeCostCenter() {
      this.payeeCostCenter = this.initialPayeeCostCenter;
    },

    initialPayerAccount() {
      this.payerAccount = this.initialPayerAccount;
    },

    initialPayerCostCenter() {
      this.payerCostCenter = this.initialPayerCostCenter;
    },

    payeeAccount() {
      this.updateCostCenterAssets();

      //TODO - check if that is needed here...
      // if (this.payeeAccount && this.payeeAccount.id !== 'new' && this.payerAccount && this.payerAccount.id !== 'new') {
      //   this.fetchLoans();
      // }

      //TODO - on transfer I think I need to update the payerAccounts, when payeeAccount changes, so that it gets prevented to book from one account to the same account
    },

    payeeAccounts() {
      this.v$.$reset();
    },

    payeeCostCenter() {
      this.updateCostCenterAssets();
    },

    payeeCostCenterAsset() {
      if (this.payeeCostCenterAsset?.isReserve && this.payerCostCenterAssets) {
        this.payerCostCenterAssets = this.payerCostCenterAssets.filter(p => !p.isReserve);
      }
    },

    payerAccount() {
      this.updateCostCenterAssets();

      //TODO - check, if that is needed here...
      // if (this.payeeAccount && this.payeeAccount.id !== 'new' && this.payerAccount && this.payerAccount.id !== 'new') {
      //   this.fetchLoans();
      // }

      //TODO - commented that our for now - but if transactionType == "transfer" I think I need to update the payeeAccounts, so that it gets prevented to book from one account to the same account
      //this.$emit('updatePayeeAccounts', this.payerAccount?.id);
    },

    payerAccounts() {
      this.v$.$reset();
    },

    payerCostCenter() {
      this.updateCostCenterAssets();
    },

    payerCostCenterAsset() {
      if (this.payerCostCenterAsset?.isReserve && this.payeeCostCenterAssets) {
        this.payeeCostCenterAssets = this.payeeCostCenterAssets.filter(p => !p.isReserve);
      }
    },

    reference() {
      this.v$.reference.$touch();
    },

    transactionType() {
      this.v$.$reset();

      this.amount = null;
      this.cycleItem = null;
      this.dayOfMonth = null;
      this.loan = null;
      this.payeeAccount = null;
      this.payeeCostCenter = null;
      this.payeeCostCenterAsset = null;
      this.payerAccount = null;
      this.payerCostCenter = null;
      this.payerCostCenterAsset = null;
      this.recurringTransaction = false;
      this.reference = null;
    },
  },
};

</script>