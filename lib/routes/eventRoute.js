const { fetchEvent, updateEvent } = require('./lib/events/events');
const { tokenValid } = require('./lib/auth/tokens');

const eventRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchEvent(event, context);
            case 'PUT':
                return await updateEvent(event, context);
            default:
                throw new Error('Page not found');
        }
    }
}

module.exports = { eventRoute }