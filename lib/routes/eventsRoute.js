const { fetchEvents, createEvent } = require('./lib/events/events');
const { tokenValid } = require('./lib/auth/tokens');

const eventsRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchEvents(event, context);
            case 'POST':
                return await createEvent(event, context);
            default:
                throw new Error('Page not found');
        }
    }
}

module.exports = { eventsRoute }