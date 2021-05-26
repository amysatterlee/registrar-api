const { fetchOffering, updateOffering, deleteOffering } = require('../offerings/offerings');
const { tokenValid } = require('../auth/tokens');

const offeringRoute = async (event, context) => {
    if (event.httpMethod == 'GET') {
        return await fetchOffering(event, context);
    }
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'PUT':
                return await updateOffering(event, context);
            case 'DELETE':
                return await deleteOffering(event, context);
            default:
                throw new Error('Page not found');
        }
    } else {
        throw new Error('Not Authorized');
    }
}

module.exports = { offeringRoute }