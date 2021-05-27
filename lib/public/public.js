const { fetchRecords } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';

const fetchPublicAccount = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, accountId, 'ACCOUNT_', 'PK, BusinessName, Phone, Address');
        const account = resp.Items[0];
        if (account) {
            return {
                id: accountId,
                businessName: account.businessName,
                phone: account.phone,
                address: account.address
            }
        } else {
            throw new Error('Account Not Found');
        }
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { fetchPublicAccount };