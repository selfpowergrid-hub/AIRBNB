
import os
from collections import Counter
from PIL import Image

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.resize((150, 150))  # Resize for faster processing
        result = image.convert('P', palette=Image.ADAPTIVE, colors=num_colors)
        result.putalpha(0)
        colors = result.getcolors(150*150)
        return sorted(colors, key=lambda x: x[0], reverse=True)
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return []

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

files = [f for f in os.listdir('.') if f.endswith('.jpeg') or f.endswith('.jpg')]

print("Analyzing images for colors...")
for file in files:
    print(f"\nFile: {file}")
    colors = get_dominant_colors(file)
    for count, color in colors:
        # color is a tuple (r, g, b) usually, unless palette weirdness
        # In 'P' mode, color is an index if we don't convert back.
        # Let's use RGB mode for simplicity
        pass


def is_teal(r, g, b):
    # Teal is generally High G, High B, Low R. G and B should be close.
    # Ex: 0, 128, 128
    return g > r and b > r and abs(g - b) < 60 and g > 50

def is_dark(r, g, b):
    return r < 60 and g < 60 and b < 60

print("\n--- BRAND COLOR ANALYSIS ---")
all_teals = []
all_darks = []

for file in files:
    try:
        img = Image.open(file).convert('RGB')
        img = img.resize((100, 100))
        pixels = list(img.getdata())
        
        teals = [p for p in pixels if is_teal(*p)]
        darks = [p for p in pixels if is_dark(*p)]
        
        all_teals.extend(teals)
        all_darks.extend(darks)
    except:
        continue


import json

output = {}

if all_teals:
    common_teal = Counter(all_teals).most_common(1)[0][0]
    output["teal"] = {"hex": rgb_to_hex(common_teal), "rgb": common_teal}
else:
    output["teal"] = {"hex": "#008080", "rgb": (0, 128, 128)}

if all_darks:
    common_dark = Counter(all_darks).most_common(1)[0][0]
    output["dark"] = {"hex": rgb_to_hex(common_dark), "rgb": common_dark}
else:
    output["dark"] = {"hex": "#1a1a1a", "rgb": (26, 26, 26)}

with open("colors.json", "w") as f:
    json.dump(output, f)



