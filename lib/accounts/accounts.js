const uuid = require('uuid');
const crypto = require('crypto');
const { generateToken } = require('../auth/tokens'); 
const { createRecord, fetchInverted, fetchRecords, updateRecord } = require('../aws/dynamo');

const TABLE_NAME = 'registrar';
const BUCKET = 'queuetime-registrar';

const findByEmail = async (email) => {
    // see if the email exists in the secondary index and retun the key id
    try {
        const resp = await fetchInverted(TABLE_NAME, `ACCOUNT_${email}`, "PK, SK, secret");
        const account = resp.Items[0];
        return {
            id: account.PK,
            email: account.SK,
            passwordHash: account.secret
        }
    } catch(e) {
        return;
    }
};

const createAccount = async (event, context) => {
    // create account
    const accountId = uuid.v4();
    const body = JSON.parse(event.body);
    if (!body.password || !body.email || !body.businessName || !body.phone) { throw new Error('Invalid Email or Password') }
    const result = await findByEmail(body.email);
    if (result) {
        throw new Error('Account already exists with that email');
    }
    const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
    const params = {
        PK: accountId,
        SK: `ACCOUNT_${body.email}`,
        secret: passwordHash,
        businessName: body.businessName,
        phone: body.phone,
        streetOne: body.streetOne,
        streetTwo: body.streetTwo,
        city: body.city,
        state: body.state,
        zip: body.zip
    };
    try {
        await createRecord(TABLE_NAME, params, 'attribute_not_exists(SK)');
        return {
            id: accountId
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchAccount = async (event, context) => {
    const accountId = event.pathParameters.accountId;
    try {
        const resp = await fetchRecords(TABLE_NAME, accountId, 'ACCOUNT_')
        const account = resp.Items[0];
        return {
            id: account.PK,
            email: account.SK.replace('ACCOUNT_', ''),
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }
    } catch(e) {
        throw new Error(e);
    }
};

const loginAccount = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const account = await findByEmail(body.email);
        const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
        if (account && account.passwordHash == passwordHash) {
            const token = generateToken(account.id);
            return {
                id: account.id,
                email: account.email.replace('ACCOUNT_', ''),
                token
            }
        } else {
            throw new Error('Invalid Email or Password')
        }
    } catch(e) {
        throw new Error(e);
    }
};

const updatePassword = async (event, context) => {
    // update password with id and email { PK: accountId, SK: email }
    try {
        const body = JSON.parse(event.body);
        const accountId = event.pathParameters.accountId;
        const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
        const expr = 'SET secret = :password';
        const values = { ':password': passwordHash }
        const resp = await updateRecord(TABLE_NAME, accountId, body.email, expr, values);
        return { id: accountId };
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { createAccount, fetchAccount, loginAccount, updatePassword };