import fitz
import os

def extraer_paginas(pdf_path, output_dir, prefix, start=1):
    doc = fitz.open(pdf_path)
    total = len(doc)
    print(f"{os.path.basename(pdf_path)}: {total} paginas")
    for i in range(total):
        page = doc[i]
        mat = fitz.Matrix(2.0, 2.0)  # 2x = ~144 DPI, buena calidad
        pix = page.get_pixmap(matrix=mat)
        n = start + i
        fname = os.path.join(output_dir, f"{prefix}{n:02d}.jpg")
        pix.save(fname)
        print(f"  Guardado: {fname}")
    doc.close()
    return total

output = r"F:\ecopollo-cartago\catalogo_imgs"
os.makedirs(output, exist_ok=True)

pdf1 = r"F:\ecopollo-cartago\Datos\EcoPollo_Catalogo.pdf"
pdf2 = r"F:\ecopollo-cartago\Datos\ECOPOLLO CATALOGO CATEGORIAS (2) (1) (1) (1).pdf"

# Extraer pollo (pg-01 a pg-N)
n1 = extraer_paginas(pdf1, output, "pg-", start=1)

# Extraer categorias (continuando la numeracion)
extraer_paginas(pdf2, output, "pg-", start=n1+1)

total = len([f for f in os.listdir(output) if f.endswith('.jpg')])
print(f"\nTotal imagenes generadas: {total}")
