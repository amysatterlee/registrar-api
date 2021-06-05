const { fetchPublicAccount, fetchPublicOfferings, fetchPublicOffering } = require('../public/public');

const publicRoute = async (event, context) => {
    if (event.resource == '/public/{accountId}') {
        if (event.httpMethod == 'GET') {
            return await fetchPublicAccount(event, context);
        }
        throw new Error('Method not allowed');
    } else if (event.resource == '/public/{accountId}/offerings') {
        if (event.httpMethod == 'GET') {
            return await fetchPublicOfferings(event, context);
        }
        throw new Error('Method not allowed');
    } else if (event.resource == '/public/{accountId}/offerings/{offeringId}') {
        if (event.httpMethod == 'GET') {
            return await fetchPublicOffering(event, context);
        }
        throw new Error('Method not allowed');
    }
    throw new Error('Page not found');
}

module.exports = { publicRoute }