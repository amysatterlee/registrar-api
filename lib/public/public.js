const { fetchRecords } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';

const fetchPublicAccount = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, accountId, 'ACCOUNT_', 'PK, businessName, phone, streetOne, streetTwo, city, state, zip');
        const account = resp.Items[0];
        if (account) {
            return {
                id: accountId,
                businessName: account.businessName,
                phone: account.phone,
                streetOne: account.streetOne,
                streetTwo: account.streetTwo,
                city: account.city,
                state: account.state,
                zip: account.zip
            }
        } else {
            throw new Error('Account Not Found');
        }
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { fetchPublicAccount };