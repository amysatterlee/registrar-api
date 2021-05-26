const { fetchOfferings, createOffering } = require('../offerings/offerings');
const { tokenValid } = require('../auth/tokens');

const offeringsRoute = async (event, context) => {
    token = tokenValid(event, context);
    console.log(token.valid);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchOfferings(event, context);
            case 'POST':
                return await createOffering(event, context);
            default:
                throw new Error('Page not found');
        }
    }
}

module.exports = { offeringsRoute }