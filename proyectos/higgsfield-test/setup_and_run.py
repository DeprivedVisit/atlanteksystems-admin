#!/usr/bin/env python3
"""
Setup automático + test de Higgsfield
Clona el repo, instala en modo editable, ejecuta test suite.
"""

import subprocess
import sys
import os
from pathlib import Path

ROOT = Path(__file__).parent
HIGGSFIELD_DIR = ROOT / "higgsfield-source"
REPO_URL = "https://github.com/higgsfield-ai/higgsfield.git"


def run(cmd, cwd=None, check=True):
    """Ejecuta comando y muestra output en tiempo real."""
    print(f"$ {cmd}")
    result = subprocess.run(
        cmd, shell=True, cwd=cwd or ROOT,
        capture_output=False, text=True
    )
    if check and result.returncode != 0:
        print(f"❌ Falló: {cmd}")
        sys.exit(result.returncode)
    return result


def main():
    print("=" * 60)
    print("HIGGSFIELD SETUP + TEST")
    print("=" * 60)
    
    # 1. Clonar repo si no existe
    if not HIGGSFIELD_DIR.exists():
        print("\n📥 Clonando higgsfield...")
        run(f"git clone {REPO_URL} {HIGGSFIELD_DIR}")
    else:
        print("\n📂 Repo ya existe, actualizando...")
        run(f"git pull", cwd=HIGGSFIELD_DIR)
    
    # 2. Instalar en modo editable
    print("\n📦 Instalando higgsfield (editable)...")
    run(f"{sys.executable} -m pip install -e .", cwd=HIGGSFIELD_DIR)
    
    # 3. Instalar dependencias de test
    print("\n📦 Instalando requirements de test...")
    run(f"{sys.executable} -m pip install -r requirements.txt")
    
    # 4. Ejecutar test
    print("\n🧪 Ejecutando test suite...")
    result = subprocess.run(
        [sys.executable, "test_higgsfield.py"],
        cwd=ROOT,
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    
    if result.returncode == 0:
        print("\n✅ SETUP + TEST COMPLETADO EXITOSAMENTE")
        print("\n📋 Próximos pasos para entrenamiento real:")
        print("   1. Seguir setup.md (nodos GPU + SSH + Docker)")
        print("   2. Configurar GitHub Actions deploy")
        print("   3. Lanzar experimento: python -m higgsfield run alpaca")
    else:
        print("\n❌ TEST FALLÓ")
        sys.exit(1)


if __name__ == "__main__":
    main()