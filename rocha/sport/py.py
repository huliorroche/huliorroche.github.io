import json
import os
import re

import certifi
import requests

INPUT_FILE = "catalog.json"
OUTPUT_DIR = "gifs"

os.makedirs(OUTPUT_DIR, exist_ok=True)


def safe_filename(value):
    return re.sub(r"[^a-zA-Z0-9._-]", "_", value)


with open(INPUT_FILE, "r", encoding="utf-8") as f:
    exercises = json.load(f)

downloaded = 0
skipped = 0
failed = 0

session = requests.Session()

session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/141.0 Safari/537.36"
    )
})

for exercise in exercises:
    slug = exercise.get("slug") or exercise.get("possibleSlug")
    gif_url = exercise.get("gif")

    if not slug or not gif_url:
        skipped += 1
        continue

    filename = safe_filename(slug) + ".gif"
    destination = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(destination):
        print(f"SKIP     {filename}")
        skipped += 1
        continue

    try:
        response = session.get(
            gif_url,
            timeout=30,
            verify=certifi.where()
        )

        response.raise_for_status()

        # Evitar guardar una página HTML de error como .gif
        content_type = response.headers.get("Content-Type", "").lower()

        if "image" not in content_type:
            raise RuntimeError(
                f"Unexpected Content-Type: {content_type}"
            )

        with open(destination, "wb") as f:
            f.write(response.content)

        downloaded += 1

        print(
            f"OK       {filename} "
            f"({len(response.content) / 1024:.1f} KB)"
        )

    except Exception as e:
        failed += 1
        print(f"ERROR    {filename}: {e}")


print()
print("Finished")
print(f"Downloaded: {downloaded}")
print(f"Skipped:    {skipped}")
print(f"Failed:     {failed}")