const { fetchOfferings, createOffering } = require('../offerings/offerings');
const { tokenValid } = require('../auth/tokens');

const offeringsRoute = async (event, context) => {
    if (event.httpMethod == 'POST') {
        token = tokenValid(event, context);
        if (token.valid) {
            return await createOffering(event, context);
        }
        throw new Error('Not Authorized');
    }
    if (event.httpMethod == 'GET') {
        return await fetchOfferings(event, context);
    }
    throw new Error('Page not found');
}

module.exports = { offeringsRoute }