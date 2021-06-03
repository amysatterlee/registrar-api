const uuid = require('uuid');
const { createRecord, fetchRecords, fetchInverted, updateRecord, deleteRecord } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';

const createOffering = async (event, context) => {
    // create offering and prices
    /*
        {
            PK: ACCOUNT_<accountId>,
            SK: OFFERING_<offeringId>,
            title: <string>,
            description: <string>,
            instructor: <string>,
            offeringType: 'DropIn' OR 'Register' OR 'Appointment',
            ageGroup: <string>,
            category: 'dance' OR 'fitness' OR 'theatrical' OR 'other',
            offeringLocation: 'studio' OR 'zoom'
            prices: [ { description: '', price: '', id: '' }, { description: '', price: '' } ]
        }
    */
    const offeringId = uuid.v4();
    const accountId = event.pathParameters.accountId;
    const body = JSON.parse(event.body);
    // create a validation method and use that to validate input
    if (!body.title || !body.description || !body.offeringType || !body.category || !body.offeringLocation ) { throw new Error('Missing offering details') }
    const params = {
        PK: `ACCOUNT_${accountId}`,
        SK: `OFFERING_${offeringId}`,
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
        const resp = await createRecord(TABLE_NAME, params, 'attribute_not_exists(SK)');
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
    const projection = 'title, description, category, offeringLocation, offeringType, ageGroup, prices';
    try {
        const resp = await fetchInverted(TABLE_NAME, `OFFERING_${offeringId}`, projection);
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
    try {
        const resp = await fetchRecords(TABLE_NAME, `ACCOUNT_${accountId}`, 'OFFERING_');
        const offerings = resp.Items.map(item => {
            return {
                id: item.SK.replace('OFFERING_', ''),
                ...item
            }
        });
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
        const resp = await updateRecord(TABLE_NAME, `ACCOUNT_${accountId}`, `OFFERING_${offeringId}`, expr, values);
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
        const resp = await deleteRecord(TABLE_NAME, `ACCOUNT_${accountId}`, `OFFERING_${offeringId}`);
        return { message: 'success' };
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = { createOffering, fetchOffering, fetchOfferings, updateOffering, deleteOffering };