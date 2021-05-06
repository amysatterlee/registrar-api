const { createAccount, fetchAccount, loginAccount } = require('./lib/accounts');
const { tokenValid } = require('./lib/tokens');

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.resource) {
            case '/accounts':
                // users path; POST
                switch (event.httpMethod) {
                    case 'POST':
                        body = await createAccount(event, context);
                        break;
                    default:
                        throw new Error('Page not found');
                }
                break;
            case '/accounts/{accountId}':
                const token = tokenValid(event, context);
                if (token.valid) {
                    switch(event.httpMethod) {
                        case 'GET':
                            body = await fetchAccount(event, context);
                            break;
                        // case 'PUT':
                        //     body = await updateAccount(event, context);
                        //     break;
                        default:
                            throw new Error('Page not found');
                    }
                } else {
                    throw new Error('Not Authorized');
                }
                break;
            case '/login':
                // login path; POST
                switch (event.httpMethod) {
                    case 'POST':
                        body = await loginAccount(event, context);
                        break;
                    default:
                        throw new Error('Page not found');
                }
                break;
            default:
                throw new Error('Page not found');
        }
    } catch (err) {
        statusCode = '400';
        body = {error: err.message};
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
