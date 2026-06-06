#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# PASO 2 — Deploy Lambda + API Gateway
# Ejecutar: bash 02_deploy_lambda.sh
# ─────────────────────────────────────────────────────────────────

source ../lambda/.env

REGION=${AWS_REGION:-"us-east-1"}
FUNCTION="garett-rpg-api"
ROLE="garett-rpg-lambda-role"
API_NAME="garett-rpg-api"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GARETT RPG SYNC — Deploy Lambda"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 1. Crear rol IAM para Lambda
echo ""
echo "▶ Creando rol IAM para Lambda..."
TRUST_POLICY='{
  "Version":"2012-10-17",
  "Statement":[{
    "Effect":"Allow",
    "Principal":{"Service":"lambda.amazonaws.com"},
    "Action":"sts:AssumeRole"
  }]
}'

ROLE_ARN=$(aws iam create-role \
  --role-name $ROLE \
  --assume-role-policy-document "$TRUST_POLICY" \
  --query "Role.Arn" --output text --no-cli-pager 2>/dev/null || \
  aws iam get-role --role-name $ROLE --query "Role.Arn" --output text --no-cli-pager)

aws iam attach-role-policy \
  --role-name $ROLE \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --no-cli-pager

aws iam attach-role-policy \
  --role-name $ROLE \
  --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/garett-rpg-policy" \
  --no-cli-pager

echo "✅ Rol: $ROLE_ARN"
echo "   Esperando 10s para que el rol se propague..."
sleep 10

# 2. Empaquetar Lambda
echo ""
echo "▶ Empaquetando Lambda..."
cd ../lambda
zip -q function.zip handler.py
echo "✅ function.zip creado"

# 3. Crear o actualizar función Lambda
echo ""
echo "▶ Desplegando función Lambda: $FUNCTION..."
LAMBDA_ARN=$(aws lambda create-function \
  --function-name $FUNCTION \
  --runtime python3.12 \
  --role $ROLE_ARN \
  --handler handler.handler \
  --zip-file fileb://function.zip \
  --environment "Variables={DYNAMO_TABLE=$DYNAMO_TABLE,AWS_REGION_OVERRIDE=$REGION}" \
  --timeout 15 \
  --memory-size 256 \
  --region $REGION \
  --query "FunctionArn" --output text --no-cli-pager 2>/dev/null || \
  aws lambda update-function-code \
    --function-name $FUNCTION \
    --zip-file fileb://function.zip \
    --region $REGION \
    --query "FunctionArn" --output text --no-cli-pager)

echo "✅ Lambda: $LAMBDA_ARN"

# 4. Crear API Gateway
echo ""
echo "▶ Creando API Gateway..."
cd ../infra

API_ID=$(aws apigateway create-rest-api \
  --name $API_NAME \
  --region $REGION \
  --query "id" --output text --no-cli-pager)

ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query "items[0].id" --output text --no-cli-pager)

# Crear recursos y métodos
for PATH_PART in "progress" "save" "today"; do
  PARENT_ID=$ROOT_ID
  if [ "$PATH_PART" != "progress" ]; then
    PARENT_ID=$(aws apigateway get-resources \
      --rest-api-id $API_ID --region $REGION \
      --query "items[?pathPart=='progress'].id" --output text --no-cli-pager)
  fi

  RES_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $PARENT_ID \
    --path-part $PATH_PART \
    --region $REGION \
    --query "id" --output text --no-cli-pager)

  for METHOD in GET POST OPTIONS; do
    aws apigateway put-method \
      --rest-api-id $API_ID --resource-id $RES_ID \
      --http-method $METHOD --authorization-type NONE \
      --region $REGION --no-cli-pager 2>/dev/null

    aws apigateway put-integration \
      --rest-api-id $API_ID --resource-id $RES_ID \
      --http-method $METHOD --type AWS_PROXY \
      --integration-http-method POST \
      --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
      --region $REGION --no-cli-pager 2>/dev/null
  done
done

# Deploy
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region $REGION --no-cli-pager

API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"

# Permisos Lambda para API Gateway
aws lambda add-permission \
  --function-name $FUNCTION \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*" \
  --region $REGION --no-cli-pager 2>/dev/null

# Guardar URL en .env
sed -i "s|VITE_API_URL=.*|VITE_API_URL=$API_URL|" ../frontend/.env.local
echo "API_URL=$API_URL" >> ../lambda/.env

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PASO 2 COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  API URL: $API_URL"
echo ""
echo "  Endpoints disponibles:"
echo "  GET  $API_URL/progress"
echo "  GET  $API_URL/progress/today"
echo "  POST $API_URL/progress/save"
echo ""
echo "  ▶ Siguiente: bash 03_setup_frontend.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
