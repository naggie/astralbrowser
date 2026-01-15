#! /usr/bin/env nix-shell
#! nix-shell -i python3 -p python3 -p python3Packages.faker
"""
Generate plausible file paths for games, movies, and music into .index.txt
"""

from faker import Faker
import random
from os import path
from os import walk
from os import makedirs
from os import environ
from os import remove
import json
from time import time

SCRIPT_DIR = path.dirname(path.abspath(__file__))

DEMO_DIR = path.join(SCRIPT_DIR, "../public/tree")
INDEX_FILE = path.join(DEMO_DIR, ".index.txt")


fake = Faker()
random.seed(42)
Faker.seed(42)

game_platforms = ["PC", "PS5", "PS4", "Xbox-Series-X", "Switch"]
game_formats = ["ISO", "ROMs", "Backups", "Digital"]
game_exts = [".iso", ".bin", ".img", ".zip", ".7z"]

movie_formats = ["BluRay", "WEB-DL", "WEBRip", "HDRip", "DVDRip"]
movie_res = ["1080p", "2160p", "720p"]
movie_codecs = ["x264", "x265", "AV1"]
movie_exts = [".mkv", ".mp4"]

music_formats = ["FLAC", "MP3", "AAC", "OGG"]
music_exts = [".flac", ".mp3", ".m4a", ".ogg"]


def slugify(text: str) -> str:
    return (
        "".join(c if c.isalnum() or c in "._-" else "-" for c in text.strip())
        .replace("--", "-")
        .strip("-")
        or "untitled"
    )


# pre-generate a list of fake artists so some artists have multiple albums
artists = [slugify(fake.name()) for _ in range(1000)]


def fake_game_path():
    title = slugify(fake.catch_phrase())
    year = random.randint(2000, 2025)
    platform = random.choice(game_platforms)
    fmt = random.choice(game_formats)
    ext = random.choice(game_exts)
    return f"./Games/{platform}/{fmt}/{title} ({year}){ext}"


def fake_movie_path():
    title = slugify(fake.sentence(nb_words=3)[:-1])
    year = random.randint(1980, 2025)
    fmt = random.choice(movie_formats)
    res = random.choice(movie_res)
    codec = random.choice(movie_codecs)
    ext = random.choice(movie_exts)
    return f"./Movies/{title}.{year}.{fmt}.{res}.{codec}{ext}"


def fake_music_path():
    artist = random.choice(artists)
    album = slugify(fake.catch_phrase())
    track_no = random.randint(1, 18)
    track_title = slugify(fake.word().title())
    fmt = random.choice(music_formats)
    ext = random.choice(music_exts)
    return f"./Music/{artist}/{album}/{fmt}/{track_no:02d} - {track_title}{ext}"


# more chance to generate music paths because there are subdirectories
generators = [fake_game_path] * 10 + [fake_movie_path] + [fake_music_path] * 15

files = []

makedirs(DEMO_DIR, exist_ok=True)

for _ in range(200 * 10**3):
    file = random.choice(generators)()
    files.append(file)

with open(INDEX_FILE, "w") as f:
    # header -- file count, total size and timestamp
    f.write(
        "%d %d %d\n" % (len(files), 10**9, int(time() + 86400 * 3650))
    )  # 10 years in future
    for file in files:
        # format is size in bytes path
        f.write("%d %s\n" % (random.randint(0, 10**9), file))

# create directories and empty files for each entry
for file in files:
    full_path = path.join(DEMO_DIR, file)
    dir_name = path.dirname(full_path)
    makedirs(dir_name, exist_ok=True)
    with open(full_path, "w") as f:
        f.write("")

# make a fake autoindex entry in each dir, saving as index.json so github pages
# can pretend to be nginx autoindex with random mtime and size values
for dirpath, dirnames, filenames in walk(DEMO_DIR):
    if "FAKEINDEX_NOAUTOINDEX" in environ:
        break

    index_entries = []
    for dirname in dirnames:
        entry = {
            "name": dirname,
            "type": "directory",
            "mtime": fake.date_time_this_decade().strftime("%a, %d %b %Y %H:%M:%S GMT"),
        }
        index_entries.append(entry)
    for filename in filenames:
        entry = {
            "name": filename,
            "type": "file",
            "mtime": fake.date_time_this_decade().strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "size": random.randint(0, 10**9),
        }
        index_entries.append(entry)
    index_file_path = path.join(
        dirpath, "index.html"
    )  # use index.html for github pages to simulate nginx json autoindex
    with open(index_file_path, "w") as f:
        json.dump(index_entries, f, indent=4)


if "FAKEINDEX_DELETEFILES" in environ:
    for file in files:
        full_path = path.join(DEMO_DIR, file)
        remove(full_path)
