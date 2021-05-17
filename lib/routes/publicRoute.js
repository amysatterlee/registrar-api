const { fetchPublicEvent } = require('../public/public');

const publicRoute = async (event, context) => {
    switch (event.httpMethod) {
        case 'GET':
            return await fetchPublicEvent(event, context);
        default:
            throw new Error('Page not found');
    }
}

module.exports = { publicRoute }