const { createAccount } = require('../accounts/accounts');

const accountsRoute = async (event, context) => {
    switch (event.httpMethod) {
        case 'POST':
            return await createAccount(event, context);
        default:
            throw new Error('Page not found');
    }
}

module.exports = { accountsRoute }