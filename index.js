const { createUser, fetchUser, loginUser, updatePassword, deleteUser, getAvatarUrl } = require('./lib/users');
const { tokenValid } = require('./lib/tokens');

// authorized single user endpoints to get, update, and delete
const userEndpoint = async (event, context) => {
    // users/{userId} path; GET, PUT, & DELETE
    if (['GET', 'PUT', 'DELETE'].includes(event.httpMethod)) {
        const token = tokenValid(event, context);
        if (token.valid) {
            switch(event.httpMethod) {
                case 'GET':
                    return await fetchUser(event, context);
                    break;
                case 'PUT':
                    return await updatePassword(event, context);
                    break;
                case 'DELETE':
                    return await deleteUser(event, context);
                    break;
            }
        } else {
            throw new Error('Not Authorized');
        }
    } else {
        throw new Error('Page not found');
    }
};

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.resource) {
            case '/users':
                // users path; POST
                switch (event.httpMethod) {
                    case 'POST':
                        body = await createUser(event, context);
                        break;
                    case 'GET':
                        console.log('inside get method');
                        break;
                    default:
                        throw new Error('Page not found');
                }
                break;
            case '/users/{userId}':
                body = await userEndpoint(event, context);
                break;
            case '/users/{userId}/avatar':
                const token = tokenValid(event, context);
                if (token.valid) {
                    body = getAvatarUrl(event, context);
                } else {
                    throw new Error('Not Authorized');
                }
                break;
            case '/login':
                // /login path; POST
                switch (event.httpMethod) {
                    case 'POST':
                        body = await loginUser(event, context);
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
