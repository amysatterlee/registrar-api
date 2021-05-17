const { accountsRoute } = require('./lib/routes/accountsRoute');
const { accountRoute } = require('./lib/routes/accountRoute');
const { eventsRoute } = require('./lib/routes/eventsRoute');
const { eventRoute} = require('./lib/routes/eventRoute');
const { loginRoute } = require('./lib/routes/loginRoute');
const { publicRoute } = require('./lib/routes/publicRoute');

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
    };

    try {
        switch(event.resource) {
            case '/accounts':
                body = await accountsRoute(event, context);
                break;
            case '/accounts/{accountId}':
                body = await accountRoute(event, context);
                break;
            case '/accounts/{accountId}/events':
                body = await eventsRoute(event, context);
                break;
            case '/accounts/{accountId}/events/{eventId}':
                body = await eventRoute(event, context);
                break;
            case '/events/{eventId}':
                body = await publicRoute(event, context);
                break;
            case '/login':
                body = await loginRoute(event, context);
                break;
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