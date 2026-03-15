"""
Generates PWA icons for the 26-day-glow app at two sizes (192x192 and 512x512).
Each icon is a sage green circle with white bold "26" text centered inside.
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(PROJECT_ROOT, "public", "icons")

SAGE_GREEN = "#7A9E7E"
WHITE = "#FFFFFF"

SIZES = {
    "icon-192.png": 192,
    "icon-512.png": 512,
}


def generate_icon(size: int, output_path: str) -> None:
    # Use RGBA for anti-aliasing; draw at 4x then downscale for smooth edges
    scale = 4
    canvas = size * scale

    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw circle filling the full canvas with a small inset for padding
    padding = canvas * 0.04
    draw.ellipse(
        [padding, padding, canvas - padding, canvas - padding],
        fill=SAGE_GREEN,
    )

    # Choose font size proportional to the canvas
    font_size = int(canvas * 0.42)

    # Try to load a bold system font; fall back to Pillow's default
    font = None
    bold_font_candidates = [
        # Windows system fonts
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/Arial Bold.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/verdanab.ttf",
    ]
    for path in bold_font_candidates:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, font_size)
                break
            except Exception:
                continue

    if font is None:
        # Pillow default bitmap font — no size control, but better than nothing
        font = ImageFont.load_default()

    text = "26"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = (canvas - text_w) / 2 - bbox[0]
    y = (canvas - text_h) / 2 - bbox[1]

    draw.text((x, y), text, fill=WHITE, font=font)

    # Downscale with LANCZOS for smooth anti-aliasing
    img = img.resize((size, size), Image.LANCZOS)

    # Composite onto a white background for PNG compatibility
    background = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    background.paste(img, mask=img.split()[3])
    final = background.convert("RGB")

    final.save(output_path, "PNG", optimize=True)
    print(f"Saved {output_path}  ({size}x{size})")


def main():
    os.makedirs(ICONS_DIR, exist_ok=True)

    for filename, size in SIZES.items():
        output_path = os.path.join(ICONS_DIR, filename)
        generate_icon(size, output_path)

    print("Done.")


if __name__ == "__main__":
    main()
