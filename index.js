const { accountsRoute } = require('./lib/routes/accountsRoute');
const { accountRoute } = require('./lib/routes/accountRoute');
const { offeringsRoute } = require('./lib/routes/offeringsRoute');
const { offeringRoute } = require('./lib/routes/offeringRoute');
const { pricingRoute } = require('./lib/routes/pricingRoute');
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
            case '/accounts/{accountId}/offerings':
                body = await offeringsRoute(event, context);
                break;
            case '/accounts/{accountId}/offerings/{offeringId}':
                body = await offeringRoute(event, context);
                break;
            case '/accounts/{accountId}/pricing':
                body = await pricingRoute(event, context);
                break;
            case '/accounts/{accountId}/pricing/{priceId}':
                body = await pricingRoute(event, context);
                break;
            case '/offerings/{offeringId}':
                body = await publicRoute(event, context);
                break;
            case '/login':
                body = await loginRoute(event, context);
                break;
        }
    } catch (err) {
        if (err.message.includes('Not Found')) {
            statusCode = '404';
        } else {
            statusCode = '400';
        }
        body = { error: err.message };
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};