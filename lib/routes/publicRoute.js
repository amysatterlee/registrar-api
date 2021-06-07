const { fetchPublicAccount, fetchPublicOfferings, fetchPublicOffering, createOfferingSubmission } = require('../public/public');

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
        } else if (event.httpMethod == 'POST') {
            return await createOfferingSubmission(event, context);
        }
        throw new Error('Method not allowed');
    }
    throw new Error('Page not found');
}

module.exports = { publicRoute }