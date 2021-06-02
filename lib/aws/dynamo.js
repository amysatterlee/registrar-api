const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const createRecord = async (tableName, item, condition) => {
    const createdAt = new Date();
    const params = {
        TableName: tableName,
        Item: {
            ...item,
            createdAt: createdAt.toISOString(),
            updatedAt: createdAt.toISOString()
        },
        ConditionExpression: condition
    };
    await dynamo.put(params).promise();
};

const deleteRecord = async (tableName, pKey, sKey) => {
    const params = {
        TableName: tableName,
        Key: {
            PK: pKey,
            SK: sKey
        }
    };
    await dynamo.delete(params).promise();
};

const fetchInverted = async (tableName, sKey, projection) => {
    const params = {
        TableName: tableName,
        IndexName: 'InvertedIndex',
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
            ":sk": sKey
        },
        ProjectionExpression: projection
    };
    const resp = await dynamo.query(params).promise();
    return resp;
};

const queryInverted = async (tableName, projection, condition, values) => {
    const params = {
        TableName: tableName,
        IndexName: 'InvertedIndex',
        KeyConditionExpression: condition,
        ExpressionAttributeValues: values,
        ProjectionExpression: projection
    };
    const resp = await dynamo.query(params).promise();
    return resp;
};

const fetchRecord = async (tableName, pKey, sKey) => {
    const params = {
        TableName: tableName,
        ExpressionAttributeValues: {
            ':pk': pKey,
            ':sk': sKey
        },
          KeyConditionExpression: 'PK = :pk AND SK = :sk',
          ScanIndexForward: true
    };
    const resp = await dynamo.query(params).promise();
    return resp;
};

const fetchRecords = async (tableName, pKey, sKeySub) => {
    const params = {
        TableName: tableName,
        ExpressionAttributeValues: {
            ':pk': pKey,
            ':sk': sKeySub
        },
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ScanIndexForward: true
    };
    const resp = await dynamo.query(params).promise();
    return resp;
}

const updateRecord = async (tableName, pKey, sKey, expression, valuesHash) => {
    const updatedAt = new Date();
    const params = {
        TableName: tableName,
        Key: {
            PK: pKey,
            SK: sKey
        },
        UpdateExpression: `${expression}, updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ...valuesHash,
            ':updatedAt': updatedAt.toISOString()
        }
    };
    const resp = await dynamo.update(params).promise();
    return resp;
};

module.exports = { createRecord, deleteRecord, fetchInverted, fetchRecord, fetchRecords, updateRecord, queryInverted }