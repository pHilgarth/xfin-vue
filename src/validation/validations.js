import { required, maxLength } from "@vuelidate/validators";
import {
    accountRoleValidator,
    amountValidator,
    bicValidator,
    ibanValidator,
    lifeValidator,
    monthlyInstallmentValidator,
    optionalAmountValidator,
    rateOfInterestValidator,
} from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required, maxLength: maxLength(25),
    },
};

export const accountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    //balance:    { balanceValidator },
};

export const counterPartValidation = {
    counterPartIban:        { ibanValidator },
    counterPartBic:         { bicValidator },
};

export const loanValidation = {
    accountRole:            { accountRoleValidator },
    amount:                 { amountValidator },
    counterParty:           { required },
    life:                   { lifeValidator },
    monthlyInstallment:     { monthlyInstallmentValidator },
    rateOfInterest:         { rateOfInterestValidator },
    reference:              { required },
}

export const reserveValidation = {
    title: { required, maxLength: maxLength(30) },
    targetAmount: { optionalAmountValidator }
};

export const transactionValidation = {
    amount:                 { amountValidator },
    externalParty:          { required },
    reference:              { required },
};

export const userValidation = {
    userMail:               { required },
    userPassword:           { required },
};