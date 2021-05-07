const uuid = require('uuid');
const { createRecord, fetchRecord, fetchRecords, updateRecord } = require('../aws/dynamo');
const { getUploadUrl } = require('../aws/s3');

const TABLE_NAME = 'registrar';
const BUCKET = 'queuetime-registrar';

const createEvent = async (event, context) => {
    // create event { PK: <accountId>, SK: EVENT_<eventId>, active: true, title, details: <json object containing all remaining details of event> }
    const eventId = uuid.v4();
    const accountId = event.pathParameters.accountId;
    const body = JSON.parse(event.body);
    if (!body.title || !body.details) { throw new Error('Missing event details') }
    const params = {
        PK: accountId,
        SK: `EVENT_${eventId}`,
        title: body.title,
        active: true,
        details: body.details
    };
    try {
        await createRecord(TABLE_NAME, params, 'attribute_not_exists(SK)');
        return {
            id: eventId,
            title: body.title,
            active: true,
            details: body.details
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchEvent = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    const eventId = event.pathParameters.eventId;
    try {
        const resp = await fetchRecord(TABLE_NAME, accountId, `EVENT_${eventId}`)
        const event = resp.Items[0];
        return {
            id: eventId,
            ...event
        }
    } catch(e) {
        throw new Error(e);
    }
};

const fetchEvents = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, accountId, 'EVENT_')
        const events = resp.Items.map(item => (
            {
                id: item.SK.replace('EVENT_', ''),
                ...item
            }
        ));
        return { events }
    } catch(e) {
        throw new Error(e);
    }
};

const updateEvent = async (event, context) => {
    // update event
    try {
        const body = JSON.parse(event.body);
        const accountId = event.pathParameters.accountId;
        const eventId = event.pathParameters.eventId;
        const expr = 'SET title = :title, details = :details';
        const values = { ':title': body.title, ':details': body.details }
        const resp = await updateRecord(TABLE_NAME, accountId, `EVENT_${eventId}`, expr, values);
        return { id: eventId };
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { createEvent, fetchEvent, fetchEvents, updateEvent };