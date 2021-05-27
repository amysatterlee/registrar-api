const uuid = require('uuid');
const { createRecord, fetchRecord, fetchInverted, updateRecord, deleteRecord } = require('../aws/dynamo');

const TABLE_NAME = 'registrar-offerings';

const createOffering = async (event, context) => {
    // create offering
    /*
        {
            PK: <offeringId>,
            SK: ACCOUNT_<accountId>,
            title: <string>,
            description: <string>,
            instructor: <string>,
            offeringType: 'DropIn' OR 'Register' OR 'Appointment',
            ageGroup: <string>,
            category: 'dance' OR 'fitness' OR 'theatrical' OR 'other',
            offeringLocation: 'studio' OR 'zoom'
            prices: [{ unique key, description, price }]
        }
    */
    const offeringId = uuid.v4();
    const accountId = event.pathParameters.accountId;
    const body = JSON.parse(event.body);
    // create a validation method and use that to validate input
    if (!body.title || !body.description || !body.offeringType || !body.category || !body.offeringLocation ) { throw new Error('Missing offering details') }
    const params = {
        PK: offeringId,
        SK: `ACCOUNT_${accountId}`,
        title: body.title,
        description: body.description,
        instructor: body.instructor,
        offeringType: body.offeringType,
        ageGroup: body.ageGroup,
        category: body.category,
        offeringLocation: body.offeringLocation,
        prices: body.prices
    };
    try {
        const resp = await createRecord(TABLE_NAME, params, 'attribute_not_exists(PK)');
        console.log('response is');
        console.log(resp);
        return {
            id: offeringId
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchOffering = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    const offeringId = event.pathParameters.offeringId;
    try {
        const resp = await fetchRecord(TABLE_NAME, offeringId, `ACCOUNT_${accountId}`);
        const offering = resp.Items[0];
        return {
            id: offeringId,
            ...offering
        }
    } catch(e) {
        throw new Error(e);
    }
};

const fetchOfferings = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    const selectExpr = 'PK, SK, title, description, instructor, offeringType, ageGroup, category, offeringLocation, prices';
    try {
        const resp = await fetchInverted(TABLE_NAME, `ACCOUNT_${accountId}`, selectExpr);
        const offerings = resp.Items.map(item => (
            {
                id: item.PK,
                ...item
            }
        ));
        return { offerings }
    } catch(e) {
        throw new Error(e);
    }
};

const updateOffering = async (event, context) => {
    // update offering
    try {
        const body = JSON.parse(event.body);
        const accountId = event.pathParameters.accountId;
        const offeringId = event.pathParameters.offeringId;
        const expr = 'SET title = :title, description = :d, instructor = :i, offeringType = :t, ageGroup = :a, category = :c, offeringLocation = :l, prices = :p';
        const values = {
            ':title': body.title,
            ':d': body.description,
            ':i': body.instructor,
            ':t': body.offeringType,
            ':a': body.ageGroup,
            ':c': body.category,
            ':l': body.offeringLocation,
            ':p': body.prices
        }
        const resp = await updateRecord(TABLE_NAME, offeringId, `ACCOUNT_${accountId}`, expr, values);
        console.log('response is');
        console.log(resp);
        return { id: offeringId };
    } catch(e) {
        throw new Error(e);
    }
};

const deleteOffering = async (event, context) => {
    // delete offering
    try {
        const accountId = event.pathParameters.accountId;
        const offeringId = event.pathParameters.offeringId;
        const resp = await deleteRecord(TABLE_NAME, offeringId, `ACCOUNT_${accountId}`);
        return { message: 'success' };
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = { createOffering, fetchOffering, fetchOfferings, updateOffering, deleteOffering };