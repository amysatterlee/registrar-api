const { fetchRecords, queryRecords, createRecord } = require('../aws/dynamo');

const TABLE_NAME = process.env.TABLE_NAME; // 'registrar'

const buildQuery = (pKey, sKeySub, queryParams) => {
    let condition = 'PK = :pk AND begins_with(SK, :sk)';
    let values = {
        ':pk': pKey,
        ':sk': sKeySub
    };
    let filter;
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (filter) {
                filter += ` AND ${key} = :${key}`;
            } else {
                filter = `${key} = :${key}`;
            }
            values[`:${key}`] = value;
        }
    }
    return {
        condition: condition,
        filter: filter,
        values: values
    }
}

const fetchPublicAccount = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, `ACCOUNT_${accountId}`, 'ACCOUNT_');
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
    const priceExpr = 'PK, SK, description, price';
    try {
        const query = buildQuery(`ACCOUNT_${accountId}`, 'OFFERING_', event.queryStringParameters);
        const projection = 'PK, SK, category, description, offeringType, offeringLocation, title, ageGroup, instructor, prices';
        const resp = await queryRecords(TABLE_NAME, projection, query.condition, query.filter, query.values);
        const items = resp.Items.map(item => {
            return {
                id: item.SK.replace('OFFERING_', ''),
                title: item.title,
                description: item.description,
                category: item.category,
                offeringType: item.offeringType,
                offeringLocation: item.offeringLocation,
                ageGroup: item.ageGroup,
                instructor: item.instructor,
                prices: item.prices
            }
        });
        return items;
    } catch(e) {
        throw new Error(e);
    }
}

const fetchPublicOffering = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    const offeringId = event.pathParameters.offeringId;
    try {
        const resp = await fetchRecords(TABLE_NAME, `ACCOUNT_${accountId}`, `OFFERING_${offeringId}`);
        const item = resp.Items[0];
        return {
            id: item.SK.replace('OFFERING_', ''),
            title: item.title,
            description: item.description,
            category: item.category,
            offeringType: item.offeringType,
            offeringLocation: item.offeringLocation,
            ageGroup: item.ageGroup,
            instructor: item.instructor,
            prices: item.prices
        }
    } catch(e) {
        throw new Error(e);
    }
}

const createOfferingSubmission = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    const offeringId = event.pathParameters.offeringId;
    const body = JSON.parse(event.body);
    if (!body.email || !body.name || !body.phone ) { throw new Error('Missing offering details') }
    const params = {
        PK: `OFFERING_${offeringId}`,
        SK: `SUBMISSION_${body.email}`,
        name: body.name,
        phone: body.phone,
        comment: body.comment
    }
    try {
        const resp = await createRecord(TABLE_NAME, params, null);
        console.log('response is');
        console.log(resp);
        return { status: 'submitted' };
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = { fetchPublicAccount, fetchPublicOfferings, fetchPublicOffering, createOfferingSubmission };