const { fetchAccount } = require('../accounts/accounts');
const { tokenValid } = require('../auth/tokens');

const accountRoute = async (event, context) => {
    token = tokenValid(event, context);
    if (token.valid) {
        switch(event.httpMethod) {
            case 'GET':
                return await fetchAccount(event, context);
            default:
                throw new Error('Page not found');
        }
    } else {
        throw new Error('Not Authorized');
    }
}

module.exports = { accountRoute }