const baseUrl = "http://localhost:2905/api";

export const TransactionRoleService = {
    transactionRoles: [
        {
            value: 'default',
            label: 'reguläre Transaktion',
        },
        {
            value: 'repayment',
            label: 'Tilgung',
        },
        {
            value: 'loan',
            label: 'Darlehen',
        },
        {
            value: 'reserve',
            label: 'Sparrate',
        },
    ],

    async getItems(transactionRole, accountId) {
        const url = `${baseUrl}/${transactionRole}s/account/${accountId}`;

        try {
            return await fetch(url).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return [];
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },
}