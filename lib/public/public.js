const { fetchInverted } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';

const fetchPublicEvent = async (event, context) => {
    const eventId = event.pathParameters.eventId;
    try {
        const resp = await fetchInverted(TABLE_NAME, `EVENT_${eventId}`, "PK, SK, title, description, ticketOptions");
        const event = resp.Items[0];
        if (event) {
            return {
                id: eventId,
                ...event
            }
        } else {
            throw new Error('Event Not Found');
        }
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { fetchPublicEvent };