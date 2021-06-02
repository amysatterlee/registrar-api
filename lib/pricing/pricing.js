const uuid = require('uuid');
const { createRecord, fetchRecords, updateRecord, deleteRecord } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';

const createPrice = async (event, context) => {
    // create price
    /*
        {
            PK: ACCOUNT_<accountId>,
            SK: PRICE_<priceId>,
            description: <string>,
            price: <float>
        }
    */
    const priceId = uuid.v4();
    const accountId = event.pathParameters.accountId;
    const body = JSON.parse(event.body);
    // create a validation method and use that to validate input
    if (!body.description || !body.price ) { throw new Error('Missing price details') }
    const params = {
        PK: `ACCOUNT_${accountId}`,
        SK: `PRICE_${priceId}`,
        description: body.description,
        price: body.price
    };
    try {
        const resp = await createRecord(TABLE_NAME, params, 'attribute_not_exists(SK)');
        console.log('response is');
        console.log(resp);
        return {
            id: priceId
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchPrices = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, `ACCOUNT_${accountId}`, 'PRICE_');
        const prices = resp.Items.map(item => (
            {
                id: item.SK.replace('PRICE_', ''),
                ...item
            }
        ));
        return { prices }
    } catch(e) {
        throw new Error(e);
    }
};

const updatePrice = async (event, context) => {
    // update price
    try {
        const body = JSON.parse(event.body);
        const accountId = event.pathParameters.accountId;
        const priceId = event.pathParameters.priceId;
        const expr = 'SET description = :d, price = :p';
        const values = {
            ':d': body.description,
            ':p': body.price
        }
        const resp = await updateRecord(TABLE_NAME, `ACCOUNT_${accountId}`, `PRICE_${priceId}`,  expr, values);
        console.log('response is');
        console.log(resp);
        return { id: priceId };
    } catch(e) {
        throw new Error(e);
    }
};


const deletePrice = async (event, context) => {
    // delete price
    try {
        const accountId = event.pathParameters.accountId;
        const priceId = event.pathParameters.priceId;
        const resp = await deleteRecord(TABLE_NAME, `ACCOUNT_${accountId}`, `PRICE_${priceId}`);
        return { message: 'success' };
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { createPrice, fetchPrices, updatePrice, deletePrice };