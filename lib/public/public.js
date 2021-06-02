const { fetchRecords, fetchInverted, queryInverted } = require('../aws/dynamo');

const ACCOUNT_TABLE = 'registrar';
const OFFERINGS_TABLE = 'registrar-offerings';
const PRICES_TABLE = 'registrar-pricing';

const buildQuery = (sKey, queryParams) => {
    /*
    "KeyConditionExpression": "Id = :v1 AND PostedBy BETWEEN :v2a AND :v2b",
    "ExpressionAttributeValues": {
        ":v1": {"S": "Amazon DynamoDB#DynamoDB Thread 1"},
        ":v2a": {"S": "User A"},
        ":v2b": {"S": "User C"}
    }
    */
    let condition = `SK = :sk`;
    let values = {
        ':sk': sKey
    };
    for (const [key, value] of Object.entries(queryParams)) {
        condition += ` AND ${key} = :${key}`;
        values[`:${key}`] = value;
    }
    return {
        condition: condition,
        values: values
    }
}

const fetchPublicAccount = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(ACCOUNT_TABLE, accountId, 'ACCOUNT_', 'PK, businessName, phone, streetOne, streetTwo, city, state, zip');
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

const fetchPublicOfferings = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    console.log(event.queryStringParameters);
    const priceExpr = 'PK, SK, description, price';
    try {
        const query = buildQuery(`ACCOUNT_${accountId}`, event.queryStringParameters);
        console.log(query);
        const projection = 'PK, category, description, offeringType, offeringLocation, title, ageGroup, prices';
      //  const resp = await queryInverted(OFFERINGS_TABLE, projection, query.condition, query.values);
        const resp = await fetchInverted(OFFERINGS_TABLE, `ACCOUNT_${accountId}`, projection);
        console.log(resp);
        const items = resp.Items.map(item => {
            const prices = fetchInverted(PRICES_TABLE, `ACCOUNT_${accountId}`, priceExpr);
            return {
                id: item.PK,
                title: item.title,
                description: item.description,
                category: item.category,
                offeringType: item.offeringType,
                offeringLocation: item.offeringLocation,
                ageGroup: item.ageGroup,
                prices: prices.Items
            }
        });
        return items;
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = { fetchPublicAccount, fetchPublicOfferings };