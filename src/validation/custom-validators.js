import { numberService } from '@/services/number-service';
import { helpers } from '@vuelidate/validators';

const amountRegex = /^0?,0[1-9]$|^0?,[1-9][0-9]?$|^[1-9][0-9]*$|^[1-9][0-9]*,[0-9]{1,2}$/;

export const accountRoleValidator = (value) => value === 'creditor' || value === 'debitor';
/* amount regex:

    allows a single leading zero with comma and 1 or 2 decimals
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const amountValidator = (value) => value.match(amountRegex);
/* balance regex:

    allows negative values

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const balanceValidator = (value) => value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
export const bicValidator = (value) => value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const costCenterIdValidator = (value) => value > 0;
export const dayOfMonthValidator = (value) => value.match(/^[0-9]+$/) && parseInt(value) > 0 && parseInt(value) <= 28;
export const freeBudgetValidator = (value) => numberService.parseFloat(value) >= 0;
export const ibanValidator = (value) => value.match(/^[a-zA-Z]{2}[0-9]{20}$/);
export const lifeValidator = (value) => (value === '' || value === null || value === undefined) || value > 0 && value.match(/^[0-9]+$/);
export const monthlyInstallmentValidator = (value) => value > 0;
export const optionalAmountValidator = (value) => (value === '' || value === null || value === undefined) || value.match(amountRegex);
export const optionalBicValidator = (value) => (value === '' || value === null || value === undefined) || value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const optionalIbanValidator = (value) => (value === '' || value === null || value === undefined) ||value.match(/^[a-zA-Z]{2}[0-9]{20}$/);

export const rateOfInterestValidator = (value) => value > 0;
export const targetDateValidator = (value) => (value === '' || value === null || value === undefined) || value.match(/* TODO - regex missing!!! check how's the value of a date input looks like */);
export const zeroAmountValidator = (value) => value.match(/^(0|[1-9][0-9]*)?,?[0-9]{1,2}$/);

export const firstSelectValidator = (secondSelect) => helpers.withParams(
    { secondSelect: secondSelect },
    (value) => {
        console.log(`validating firstSelect - secondSelect is: ${secondSelect + ' (' + typeof(secondSelect) + ')' || '(its null or empty)'}`);

        if (secondSelect === '1') {
            return value === 'A';
        }
        else if (secondSelect === '2') {
            return value === 'B';
        }
        else if (secondSelect === '3') {
            return value === 'C';
        }
        else {
            return true;
        }
    }
);

export const ibanDuplicateValidator = (ibans) => helpers.withParams(
    { ibans: ibans },
    (value) => { return value !== null ? !ibans.includes(value.toUpperCase()) : true;},
);

export const secondSelectValidator = (firstSelect) => (value) => {
    console.log(`validating secondSelect - firstSelect is: ${firstSelect || '(its null or empty)'}`);

    if (value === '') {
        return false;
        //console.log('value is empty string');
    }
    else {
        return true;
    }
    //return value !== 'C' && value !== '';
}

export const transactionTypeValidator = (costCenter) => helpers.withParams(
    { costCenter },
    (value) => {
        return !(costCenter === 'Nicht zugewiesen' && (value === 'Darlehen' || value === 'Sparrate'));
    },
);