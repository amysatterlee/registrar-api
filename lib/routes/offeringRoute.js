const { fetchOffering, updateOffering, deleteOffering } = require('../offerings/offerings');
const { tokenValid } = require('../auth/tokens');

const offeringRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchOffering(event, context);
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