const amountErrorMessage =                              'Bitte gib einen gültigen Betrag ein!';
const bicErrorMessage =                                 'Bitte gib einen gültigen BIC ein!';
const ibanErrorMessage =                                'Bitte gib eine gültige IBAN ein!';
const ibanDuplicateErrorMessage =                       'Diese IBAN existiert bereits!';
const nameErrorMessage =                                'Bitte gib einen Namen ein!';
const referenceErrorMessage =                           'Bitte gib einen Verwendungszweck ein!';

//TODO - change every service name to UpperCase
export const errorService = {
    errorMessages: {
        //amount errors
        amount:                                 amountErrorMessage,

        //balance errors
        balance:                                amountErrorMessage,

        //bic errors
        bic:                                    bicErrorMessage,

        //costCenter errors
        costCenter:                             'Diese Kostenstelle passt nicht zum gewählten Transaktions-Typ!',

        //externalParty errors
        externalParty:                            'Bitte gib einen {externalPartyType} an!',
        externalPartyIban:                        ibanErrorMessage,
        externalPartyBic:                         bicErrorMessage,
        externalPartyIban_ibanDuplicate:          ibanDuplicateErrorMessage,

        //freeBudget errors                     //{...} gets replaced by the function getErrorMessage in MoleculeInputText
        //freeBudget:                             'Der Mindestbetrag für dieses Konto beträgt {minimalAmount}!',
        freeBudget:                             'Dieser Posten darf nicht negativ sein!',

        //iban errors
        iban_ibanValidator:                     ibanErrorMessage,
        iban_ibanDuplicate:                     ibanDuplicateErrorMessage,

        //name errors
        name_required:                          nameErrorMessage,
        name_maxLength:                         'Der Name darf nicht länger als 15 Zeichen sein!',
        name_nameDuplicate:                     'Dieser Name existiert bereits!',

        //reference errors
        reference:                              referenceErrorMessage,

        //targetAmount errors
        targetAmount:                           amountErrorMessage,

        //title errors
        title_required:                         'Bitte gib einen Titel ein!',
        title_maxLength:                        'Der Titel darf nicht länger als 30 Zeichen sein!',

        //transactionRole errors
        transactionRole:                        'Dieser Transaktions-Typ passt nicht zur gewählten Kostenstelle!',
    },

    getErrorMessage(property, validator, params) {
        let errorMessage = this.errorMessages[`${property}_${validator}`] || this.errorMessages[property];

        for (const key in params) {
            errorMessage = errorMessage.replace(`{${key}}`, params[key]);
        }

        //TODO - implement error handling: if the error message contains {...} substrings, but no params were passed to this function, return an empty errorMessage to prevent outputting weird strings

        return errorMessage;
    }
}