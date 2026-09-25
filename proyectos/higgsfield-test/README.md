# Higgsfield Test Suite

Validación básica de imports, estructura y compatibilidad de Higgsfield 0.0.3.

## ⚠️ Nota importante

**Este test NO entrena modelos.** Solo valida:
- Imports de módulos core
- Decorador `@experiment`
- Model zoo (Llama7b/13b/70b)
- LlamaLoader
- Sintaxis de experimento típico

**Entrenamiento real requiere:**
- Nodos GPU (Ubuntu + SSH + sudo no-password)
- `setup.md` completado (Docker, deploy keys, higgsfield binary)
- `pip install higgsfield==0.0.3` en cada nodo

## Quick Start

```bash
# 1. Crear venv
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Instalar deps
pip install -r requirements.txt

# 3. Ejecutar test
python test_higgsfield.py
```

## Estructura

```
higgsfield-test/
├── test_higgsfield.py    # Test suite principal
├── requirements.txt      # Dependencias
└── README.md             # Este archivo
```

## Resultados esperados

```
============================================================
HIGGSFIELD TEST SUITE v0.0.3
============================================================

✅ Imports core OK
✅ @experiment decorator OK
✅ Model zoo (7B, 13B, 70B) disponible
✅ LlamaLoader OK
✅ Estructura de experimento válida
✅ Requisitos de entorno OK

============================================================
RESUMEN
============================================================
  [PASS] Imports core
  [PASS] @experiment decorator
  [PASS] Model zoo
  [PASS] LlamaLoader
  [PASS] Estructura experimento
  [PASS] Requisitos config

Total: 6/6 tests passed

✅ Test suite PASSED — Estructura válida
⚠️  Para ejecución real: seguir setup.md (nodos GPU + SSH)
```

## Si falla el import

```bash
# Clonar repo oficial y instalar en modo editable
git clone https://github.com/higgsfield-ai/higgsfield.git higgsfield-source
cd higgsfield-source
pip install -e .
cd ..
python test_higgsfield.py
```

## Referencias

- [Higgsfield GitHub](https://github.com/higgsfield-ai/higgsfield)
- [Setup Guide](https://github.com/higgsfield-ai/higgsfield/blob/main/setup.md)
- [Tutorial](https://github.com/higgsfield-ai/higgsfield/blob/main/tutorial.md)