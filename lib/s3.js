const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const getUploadUrl = (bucket, key, expires = 60) => {
    const url = s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: key,
        Expires: expires
    })
    return url;
}

module.exports = { getUploadUrl }