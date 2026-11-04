"""Contact sheet: python3 sheet.py out.png img1 img2 ... (grid of 4 columns, safe-zone guides optional)."""
import sys
from PIL import Image, ImageDraw

out, paths = sys.argv[1], sys.argv[2:]
guides = out.endswith("_g.png")
cw, ch, gap = 360, 640, 16
cols = min(4, len(paths))
rows = (len(paths) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cw + (cols + 1) * gap, rows * ch + (rows + 1) * gap), (60, 60, 60))
for k, pth in enumerate(paths):
    im = Image.open(pth).convert("RGB").resize((cw, ch), Image.LANCZOS)
    if guides:
        d = ImageDraw.Draw(im)
        d.line((0, ch * 0.12, cw, ch * 0.12), fill=(0, 160, 255), width=1)
        d.line((0, ch * 0.78, cw, ch * 0.78), fill=(0, 160, 255), width=1)
    sheet.paste(im, (gap + (k % cols) * (cw + gap), gap + (k // cols) * (ch + gap)))
sheet.save(out)
