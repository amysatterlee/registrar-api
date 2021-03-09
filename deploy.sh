zip -r users-api.zip .
aws lambda update-function-code --function-name users-api --zip-file fileb://users-api.zip
