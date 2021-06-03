const { fetchOfferings, createOffering } = require('../offerings/offerings');
const { tokenValid } = require('../auth/tokens');

const offeringsRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch (event.httpMethod) {
            case 'POST':
                return await createOffering(event, context);
            case 'GET':
                return await fetchOfferings(event, context);
            default:
                throw new Error('Page not found');
        }
    } else {
        throw new Error('Not Authorized');
    }
}

module.exports = { offeringsRoute }