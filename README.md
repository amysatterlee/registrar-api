# Registrar API

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
