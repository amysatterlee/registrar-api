const uuid = require('uuid');
const { createRecord, fetchRecord, fetchRecords, updateRecord, deleteRecord } = require('../aws/dynamo');
const { getUploadUrl } = require('../aws/s3');

const TABLE_NAME = 'registrar-offerings';
const BUCKET = 'queuetime-registrar';

const createOffering = async (event, context) => {
    // create offering
    /*
        {
            PK: <offeringId>,
            SK: ACCOUNT_<accountId>,
            title: <string>,
            description: <string>,
            instructor: <string>,
            type: 'DropIn' OR 'Register' OR 'Appointment',
            ageGroup: <string>,
            category: 'dance' OR 'fitness' OR 'theatrical' OR 'other',
            location: 'studio' OR 'zoom'
            prices: [{ unique key, description, price }]
        }
    */
    const offeringId = uuid.v4();
    const accountId = event.pathParameters.accountId;
    const body = JSON.parse(event.body);
    // create a validation method and use that to validate input
    if (!body.title || !body.description || !body.type || !body.category || !body.location || !body.prices ) { throw new Error('Missing offering details') }
    const params = {
        PK: offeringId,
        SK: `ACCOUNT_${accountId}`,
        title: body.title,
        description: body.description,
        instructor: body.instructor,
        type: body.type,
        ageGroup: body.ageGroup,
        category: body.category,
        location: body.location,
        prices: body.prices
    };
    try {
        const resp = await createRecord(TABLE_NAME, params, 'attribute_not_exists(PK)');
        console.log(resp);
        return resp;
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
    const selectExpr = 'PK, SK, title, description, instructor, type, ageGroup, category, location, prices';
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
        const expr = 'SET title = :t, description = :d, instructor = :i, type = :t, ageGroup = :a, category = :c, location = :l, prices = :p';
        const values = {
            ':t': body.title,
            ':d': body.description,
            ':i': body.instructor,
            ':t': body.type,
            ':a': body.ageGroup,
            ':c': body.category,
            ':l': body.location,
            ':p': body.prices
        }
        const resp = await updateRecord(TABLE_NAME, offeringId, `ACCOUNT_${accountId}`, expr, values);
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