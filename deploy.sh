zip -r registrar-api.zip .
aws lambda update-function-code --function-name registrar-api --zip-file fileb://registrar-api.zip
