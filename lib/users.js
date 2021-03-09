const AWS = require('aws-sdk');
const uuid = require('uuid');
const crypto = require('crypto');
const { generateToken } = require('./tokens'); 

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'users';

const findByEmail = async (email) => {
    // see if the email exists in the secondary index and retun the key id
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'InvertedIndex',
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
            ":sk": email
        },
        ProjectionExpression: "PK, secret"
    };
    try {
        const resp = await dynamo.query(params).promise();
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
    const createdAt = new Date();
    const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
    const params = {
        TableName: TABLE_NAME,
        Item: {
            PK: userId,
            SK: body.email,
            secret: passwordHash,
            createdAt: createdAt.toISOString(),
            updatedAt: createdAt.toISOString()
        },
        ConditionExpression: 'attribute_not_exists(SK)'
    };
    try {
        await dynamo.put(params).promise();
        const token = generateToken(userId);
        return {
            id: userId,
            email: body.email,
            token,
            createdAt: createdAt.toISOString(),
            updatedAt: createdAt.toISOString()
        };
    } catch(e) {
        throw new Error(e);
    }
};

const fetchUser = async (event, context) => {
    const userId = event.pathParameters.userId;
    const params = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
            ':pk': userId
        },
          KeyConditionExpression: 'PK = :pk',
          ScanIndexForward: true
    };
    try {
        const resp = await dynamo.query(params).promise();
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
            throw new Error('Invalid User or Password')
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
        const updatedAt = new Date();
        const params = {
            TableName: TABLE_NAME,
            Key: {
                PK: userId,
                SK: body.email
            },
            UpdateExpression: "SET secret = :password, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":password": passwordHash,
                ":updatedAt": updatedAt.toISOString()
            }
        }
        const resp = await dynamo.update(params).promise();
        return (
            {
                id: userId,
                updatedAt: updatedAt.toISOString()
            }
        );
    } catch(e) {
        throw new Error(e);
    }
};

const deleteUser = async (event, context) => {
    // delete user with id and email { PK: userId, SK: email }
    const body = JSON.parse(event.body);
    const userId = event.pathParameters.userId;
    const params = {
        TableName: TABLE_NAME,
        Key: {
            PK: userId,
            SK: body.email
        }
    };
    try {
        await dynamo.delete(params).promise();
        return { status: 'deleted' };
    } catch(e) {
        throw new Error(e);
    }
};

module.exports = { createUser, fetchUser, loginUser, updatePassword, deleteUser };