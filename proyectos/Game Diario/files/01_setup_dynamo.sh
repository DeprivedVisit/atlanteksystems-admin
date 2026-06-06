#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# PASO 1 — Crear tabla DynamoDB + usuario IAM
# Ejecutar: bash 01_setup_dynamo.sh
# ─────────────────────────────────────────────────────────────────

REGION="us-east-1"          # Cambia si usas otra región
TABLE="garett-rpg"
USER="garett-rpg-user"
POLICY="garett-rpg-policy"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GARETT RPG SYNC — Setup AWS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Crear tabla DynamoDB
echo ""
echo "▶ Creando tabla DynamoDB: $TABLE..."
aws dynamodb create-table \
  --table-name $TABLE \
  --attribute-definitions \
      AttributeName=userId,AttributeType=S \
      AttributeName=date,AttributeType=S \
  --key-schema \
      AttributeName=userId,KeyType=HASH \
      AttributeName=date,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --no-cli-pager

echo "✅ Tabla creada: $TABLE"

# 2. Esperar a que la tabla esté activa
echo ""
echo "▶ Esperando que la tabla esté activa..."
aws dynamodb wait table-exists \
  --table-name $TABLE \
  --region $REGION
echo "✅ Tabla activa"

# 3. Crear item de perfil global del usuario
echo ""
echo "▶ Creando perfil inicial del usuario..."
aws dynamodb put-item \
  --table-name $TABLE \
  --item '{
    "userId":   {"S": "garett"},
    "date":     {"S": "PROFILE"},
    "totalXP":  {"N": "0"},
    "level":    {"N": "1"},
    "maxStreak":{"N": "0"},
    "unlocked": {"S": "[]"},
    "updatedAt":{"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }' \
  --region $REGION \
  --no-cli-pager
echo "✅ Perfil creado"

# 4. Crear política IAM
echo ""
echo "▶ Creando política IAM: $POLICY..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:$REGION:$ACCOUNT_ID:table/$TABLE"
    }
  ]
}
EOF
)

POLICY_ARN=$(aws iam create-policy \
  --policy-name $POLICY \
  --policy-document "$POLICY_DOC" \
  --query "Policy.Arn" \
  --output text \
  --no-cli-pager)

echo "✅ Política creada: $POLICY_ARN"

# 5. Crear usuario IAM
echo ""
echo "▶ Creando usuario IAM: $USER..."
aws iam create-user --user-name $USER --no-cli-pager
aws iam attach-user-policy \
  --user-name $USER \
  --policy-arn $POLICY_ARN \
  --no-cli-pager
echo "✅ Usuario creado y política adjuntada"

# 6. Crear access keys
echo ""
echo "▶ Generando credenciales..."
CREDS=$(aws iam create-access-key \
  --user-name $USER \
  --query "AccessKey.[AccessKeyId,SecretAccessKey]" \
  --output text \
  --no-cli-pager)

ACCESS_KEY=$(echo $CREDS | awk '{print $1}')
SECRET_KEY=$(echo $CREDS | awk '{print $2}')

# Guardar en .env
cat > ../lambda/.env << ENVEOF
AWS_REGION=$REGION
DYNAMO_TABLE=$TABLE
AWS_ACCESS_KEY_ID=$ACCESS_KEY
AWS_SECRET_ACCESS_KEY=$SECRET_KEY
USER_ID=garett
ENVEOF

cat > ../frontend/.env.local << ENVEOF
VITE_API_URL=           # Lo completamos en el Paso 2
VITE_USER_ID=garett
ENVEOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PASO 1 COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Tabla:      $TABLE"
echo "  Región:     $REGION"
echo "  Access Key: $ACCESS_KEY"
echo ""
echo "  📁 Credenciales guardadas en:"
echo "     lambda/.env"
echo "     frontend/.env.local"
echo ""
echo "  ▶ Siguiente: bash 02_deploy_lambda.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
