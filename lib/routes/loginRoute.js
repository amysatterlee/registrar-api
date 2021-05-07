const { loginAccount } = require('./lib/accounts/accounts');

const loginRoute = async (event, context) => {
    switch (event.httpMethod) {
        case 'POST':
            return await loginAccount(event, context);
            break;
        default:
            throw new Error('Page not found');
    }
}

module.exports = { loginRoute }