const uuid = require('uuid');
const crypto = require('crypto');
const { generateToken } = require('./tokens'); 
const { createRecord, deleteRecord, fetchInverted, fetchRecord, updateRecord } = require('./dynamo');
const { getUploadUrl } = require('./s3');

const TABLE_NAME = 'users';
const BUCKET = 'satterlee-familymatters';

const findByEmail = async (email) => {
    // see if the email exists in the secondary index and retun the key id
    try {
        const resp = await fetchInverted(TABLE_NAME, email, "PK, SK, secret");
        const user = resp.Items[0];
        return {
            id: user.PK,
            email: user.SK,
            passwordHash: user.secret
        }
    } catch(e) {
        return;
    }
};

const createUser = async (event, context) => {
    // create user
    const userId = uuid.v4();
    const body = JSON.parse(event.body);
    if (!body.password || !body.email) { throw new Error('Invalid Email or Password') }
    const result = await findByEmail(body.email);
    if (result) {
        throw new Error('Account already exists with that email');
    }
    const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
    const params = {
        PK: userId,
        SK: body.email,
        secret: passwordHash
    };
    try {
        await createRecord(TABLE_NAME, params, 'attribute_not_exists(SK)');
        const token = generateToken(userId);
        return {
            id: userId,
            email: body.email,
            token
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchUser = async (event, context) => {
    const userId = event.pathParameters.userId;
    try {
        const resp = await fetchRecord(TABLE_NAME, userId)
        const user = resp.Items[0];
        return {
            id: user.PK,
            email: user.SK,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    } catch(e) {
        throw new Error(e);
    }
};

const loginUser = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const user = await findByEmail(body.email);
        const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
        if (user && user.passwordHash == passwordHash) {
            const token = generateToken(user.id);
            return {
                id: user.id,
                email: user.email,
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
    // update password with id and email { PK: userId, SK: email }
    try {
        const body = JSON.parse(event.body);
        const userId = event.pathParameters.userId;
        const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
        const expr = 'SET secret = :password, updatedAt = :updatedAt';
        const values = { ':password': passwordHash }
        const resp = await updateRecord(TABLE_NAME, userId, body.email, expr, values);
        return { id: userId };
    } catch(e) {
        throw new Error(e);
    }
};

const deleteUser = async (event, context) => {
    // delete user with id and email { PK: userId, SK: email }
    const body = JSON.parse(event.body);
    const userId = event.pathParameters.userId;
    try {
        await deleteRecord(TABLE_NAME, userId, body.email);
        return { status: 'deleted' };
    } catch(e) {
        throw new Error(e);
    }
};

const getAvatarUrl = (event, context) => {
    // generate an upload url for the user avatar photo
    const userId = event.pathParameters.userId;
    const key = `avatars/${userId}/avatar`
    try {
        const resp = getUploadUrl(BUCKET, key);
        return { url: resp };
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { createUser, fetchUser, loginUser, updatePassword, deleteUser, getAvatarUrl };