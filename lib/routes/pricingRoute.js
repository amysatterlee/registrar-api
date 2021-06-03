const { fetchPrices, createPrice, updatePrice, deletePrice } = require('../pricing/pricing');
const { tokenValid } = require('../auth/tokens');

const pricingRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchPrices(event, context);
            case 'POST':
                return await createPrice(event, context);
            case 'PUT':
                return await updatePrice(event, context);
            case 'DELETE':
                return await deletePrice(event, context);
            default:
                throw new Error('Page not found');
        }
    } else {
        throw new Error('Not Authorized');
    }
}

module.exports = { pricingRoute }