from PIL import Image, ImageDraw, ImageFont
import os

width, height = 1200, 630

img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

for y in range(height):
    r = int(30 + (59 - 30) * y / height)
    g = int(58 + (130 - 58) * y / height)
    b = int(138 + (246 - 138) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

try:
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    domain_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    domain_font = ImageFont.load_default()

draw.text((width//2, height//2 - 60), "SVG Code to PNG", fill='white', font=title_font, anchor='mm')
draw.text((width//2, height//2 + 30), "Converter", fill='white', font=title_font, anchor='mm')

draw.text((width//2, height//2 + 120), "Free Online Tool - No Signup Required", fill='#e0e7ff', font=subtitle_font, anchor='mm')

draw.text((width//2, height - 60), "svgcodetopng.com", fill='#bfdbfe', font=domain_font, anchor='mm')

output_path = '/Users/y_sunshine/Documents/svgcodetopng/public/og-image.png'
img.save(output_path, 'PNG')
print(f'✅ OG image saved: {output_path}')
print(f'   Size: {width}x{height}')
