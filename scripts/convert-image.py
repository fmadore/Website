"""
Convert an image to .webp format for the website.

Generates card-size and/or hero-size versions and places them
in the correct static/images/<content-type>/ directory.

Usage:
    scripts/venv/Scripts/python.exe scripts/convert-image.py
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install it with: pip install Pillow")
    sys.exit(1)

CONTENT_TYPES = [
    "activities",
    "communications",
    "publications",
    "digital-humanities",
    "research",
    "teaching",
]

CARD_WIDTH = 800
HERO_WIDTH = 1600
WEBP_QUALITY = 80

PROJECT_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = PROJECT_ROOT / "static" / "images"


def ask_choice(prompt: str, options: list[str]) -> str:
    print(f"\n{prompt}")
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    while True:
        raw = input("Choice: ").strip()
        try:
            idx = int(raw)
            if 1 <= idx <= len(options):
                return options[idx - 1]
        except ValueError:
            if raw in options:
                return raw
        print(f"Please enter a number between 1 and {len(options)}.")


def ask_yes_no(prompt: str, default: bool = True) -> bool:
    suffix = "[Y/n]" if default else "[y/N]"
    while True:
        raw = input(f"{prompt} {suffix}: ").strip().lower()
        if raw == "":
            return default
        if raw in ("y", "yes"):
            return True
        if raw in ("n", "no"):
            return False
        print("Please enter y or n.")


def resize_and_save(img: Image.Image, max_width: int, output_path: Path) -> None:
    w, h = img.size
    if w > max_width:
        ratio = max_width / w
        new_size = (max_width, round(h * ratio))
        resized = img.resize(new_size, Image.LANCZOS)
    else:
        resized = img.copy()

    resized.save(output_path, "WEBP", quality=WEBP_QUALITY)
    size_kb = output_path.stat().st_size / 1024
    print(f"  Saved: {output_path.relative_to(PROJECT_ROOT)} ({resized.size[0]}x{resized.size[1]}, {size_kb:.0f} KB)")


def main() -> None:
    print("=== Image to WebP Converter ===")

    # 1. Source image
    while True:
        source = input("\nPath to source image: ").strip().strip('"').strip("'")
        source_path = Path(source).resolve()
        if source_path.is_file():
            break
        print(f"File not found: {source}")

    # 2. Content type
    content_type = ask_choice("Content type:", CONTENT_TYPES)

    # 3. Slug
    default_slug = source_path.stem.lower().replace(" ", "-").replace("_", "-")
    slug = input(f"\nFilename slug [{default_slug}]: ").strip() or default_slug
    slug = slug.lower().replace(" ", "-").replace("_", "-")

    # 4. Which versions to generate
    generate_card = ask_yes_no(f"\nGenerate card image? ({CARD_WIDTH}px wide)")
    generate_hero = ask_yes_no(f"Generate hero image? ({HERO_WIDTH}px wide)")

    if not generate_card and not generate_hero:
        print("Nothing to generate. Exiting.")
        return

    # 5. Open source image
    try:
        img = Image.open(source_path)
        img = img.convert("RGB")  # Ensure no alpha issues with WebP
    except Exception as e:
        print(f"Error opening image: {e}")
        sys.exit(1)

    print(f"\nSource: {source_path.name} ({img.size[0]}x{img.size[1]})")

    output_dir = IMAGES_DIR / content_type
    output_dir.mkdir(parents=True, exist_ok=True)

    # 6. Generate
    if generate_card:
        card_path = output_dir / f"{slug}.webp"
        if card_path.exists() and not ask_yes_no(f"  {card_path.name} already exists. Overwrite?", default=False):
            print("  Skipped card image.")
        else:
            resize_and_save(img, CARD_WIDTH, card_path)

    if generate_hero:
        hero_path = output_dir / f"{slug}-hero.webp"
        if hero_path.exists() and not ask_yes_no(f"  {hero_path.name} already exists. Overwrite?", default=False):
            print("  Skipped hero image.")
        else:
            resize_and_save(img, HERO_WIDTH, hero_path)

    print("\nDone!")


if __name__ == "__main__":
    main()
