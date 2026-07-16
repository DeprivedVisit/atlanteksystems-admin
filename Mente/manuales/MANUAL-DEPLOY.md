# Manual — Deploy
> Apex Cloud Work · v1.0 · Secuencia mecánica. Se ejecuta igual SIEMPRE, sin saltarse pasos.

## Secuencia
```bash
# 1. Estar parado en la carpeta correcta (el error clásico)
pwd   # debe terminar en proyectos/[cliente]

# 2. Verificar qué se va a subir
git status
git add . && git commit -m "deploy: [qué cambió]"

# 3. Sync a S3 (solo lo del proyecto, excluir basura)
aws s3 sync . s3://[bucket] --exclude ".git/*" --exclude "*.md" --exclude "node_modules/*" --delete --profile apex-admin

# 4. Invalidar CloudFront (SIN esto, el fix no existe)
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*" --profile apex-admin

# 5. Esperar a Completed
aws cloudfront get-invalidation --distribution-id [ID] --id [INVALIDATION_ID] --profile apex-admin
```

## Verificación post-deploy (2 minutos, no opcional)
- [ ] Abrir la URL en **incógnito** + Ctrl+Shift+R
- [ ] Ver el cambio específico que se subió (no solo "carga")
- [ ] Abrir en el teléfono real
- [ ] Consola sin errores nuevos
- [ ] Si tocó el form: un envío de prueba → Sheet → borrar la fila

## Registro
En LOG.md: `deploy [cliente] [fecha] — [qué cambió] — verificado incógnito+móvil`

## Los 3 errores que este manual previene
1. Sync desde la carpeta equivocada (sube el proyecto de otro cliente o basura)
2. Fix subido sin invalidación → "el cliente sigue viendo lo viejo" → doble trabajo
3. `--delete` sin revisar `git status` → borra del bucket algo que solo existía allá

## Regla
Un deploy sin la verificación de 2 minutos no es un deploy, es una apuesta.
