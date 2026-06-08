from PIL import Image
import os

src = r'F:\apex-cloudworks\proyectos\skindoctors\melasblock\4k.png'
img = Image.open(src).convert('RGB')
W, H = img.size

# Desktop: foto completa 1920x1080
desk = img.resize((1920, 1080), Image.LANCZOS)
out_d = r'F:\apex-cloudworks\proyectos\skindoctors\melasblock\4k-desktop.jpg'
desk.save(out_d, 'JPEG', quality=85, optimize=True)
print('Desktop: ' + str(desk.size) + ' — ' + str(os.path.getsize(out_d)//1024) + 'KB')

# Mobile: foto completa recortada al centro-derecha (frasco visible, sin marketing text)
cx = int(W * 0.60)
mob = img.crop((cx, 0, W, H))
mob = mob.resize((800, int(800 * H / (W - cx))), Image.LANCZOS)
out_m = r'F:\apex-cloudworks\proyectos\skindoctors\melasblock\4k.jpg'
mob.save(out_m, 'JPEG', quality=85, optimize=True)
print('Mobile: ' + str(mob.size) + ' — ' + str(os.path.getsize(out_m)//1024) + 'KB')
