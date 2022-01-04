# Registrar API

This was the start of an Educational/Registration SAAS that I was developing. It is a work in progress that will probably not be finished, other interests have taken priority. This application, when finished, would allow logged in users to set up offerings/classes, and provide a public application for non-logged in users to register for the offerings/classes. This is a Node API meant to run in AWS lambda. The deploy.sh script will zip up the files for the app and upload the package to a lambda in your AWS account titled registrar-api. An AWS DynamoDB table is required for this API.

## AWS Services Required
For this application, I developed using Lambda in a sandbox environment and did not build it locally, so that would be a future enhancment... To run this in AWS, you will need to create the following objects (another future enhancement could add terraform to the project so these objects can be created automatically and consistently)
  * Lambda - the deploy.sh script will deploy to a lambda named registrar-api (change this if you named your lambda something else)
  * DynamoDB - create a table in DynamoDB with a hash key named `PK` and a sort key named `SK`
  * IAM Role - create a lambda policy that allows for reading and writing to this DynamoDB table

## Environment Variales Required
Your lambda should have the following environment variables for this application to work:
  * TABLE_NAME = this is the DynamoDB table in the same account to which the Lambda must have read/write permissions.


## Create Account

To create an account in the Registrar:

```
POST /accounts
```
Example payload:
```
{
    "email": "amy123@test.com",
    "password": "password123",
    "businessName": "Town's Best Studio",
    "phone": "727-809-9087",
    "streetOne": "125 Gershwin Drive",
    "city": "Largo",
    "state": "FL",
    "zip": 33771
}
```
---
## Login
To login and receive a JWT:

```
POST /login
```
Example payload:
```
{
    "email": "amy123@test.com",
    "password": "password123"
}
```
Example successful result:
```
{
  "id": "3a2e47d2-decf-4d39-b7bf-c903aac98f97",
  "email": "amy123@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNhMmU0N2QyLWRlY2YtNGQzOS1iN2Jm..."
}
```
---
Use the token from login to call the following private endpoints:
## Create Offering
To create an offering on the account:
```
POST /accounts/{:account_id}/offerings
```
Include token in headers:
```
{
    "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNhMmU0N2QyLWRlY2YtNGQzOS1iN2Jm...",
    "Content-Type": "application/json"
}
```
Example payload:
```
{
    "category": "fitness",
    "offeringLocation": "both",
    "offeringType": "drop-in",
    "title": "Lunch Crunch - Cardio/Sculpt",
    "description": "This drop in class is offered both in studio and on zoom....",
    "ageGroup": "adult",
    "prices": []
}
```
Example successful result:
```
{
  "id": "43dd90f5-7b6d-47ad-b2d3-20beb925bfca"
}
```
---
## Update Offering
To update an offering:
```
PUT /accounts/{:accountId}/offerings/{:offeringId}
```
Example payload:
```
{
  "id": "dc0c8330-3ae0-4aad-9a19-1e681e1c9cfc",
  "category": "dance",
  "offeringType": "drop-in",
  "offeringLocation": "studio",
  "description": "This drop in class is meant for adults interested in learning popular Country Line routines...",
  "title": "Country Line Dance - All Levels",
  "prices": [],
  "ageGroup": "all",
  "instructor": ""
}
```
---
