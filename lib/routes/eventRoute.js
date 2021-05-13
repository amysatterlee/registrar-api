const { fetchEvent, updateEvent, deleteEvent } = require('../events/events');
const { tokenValid } = require('../auth/tokens');

const eventRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchEvent(event, context);
            case 'PUT':
                return await updateEvent(event, context);
            case 'DELETE':
                return await deleteEvent(event, context);
            default:
                throw new Error('Page not found');
        }
    }
}

module.exports = { eventRoute }