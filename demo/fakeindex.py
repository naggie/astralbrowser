#! /usr/bin/env nix-shell
#! nix-shell -i python3 -p python3 -p python3Packages.faker
"""
Generate plausible file paths for games, movies, and music.
Outputs to stdout, one path per line, similar to `find`.
Usage:
  ./fake_paths.py > paths.txt
  ./fake_paths.py 500000 > paths.txt   # custom count
"""

from faker import Faker
import random
import sys

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
        "".join(c if c.isalnum() or c in "._-" else "-"
                for c in text.strip())
        .replace("--", "-")
        .strip("-")
        or "untitled"
    )

def fake_game_path():
    title = slugify(fake.catch_phrase())
    year = random.randint(2000, 2025)
    platform = random.choice(game_platforms)
    fmt = random.choice(game_formats)
    ext = random.choice(game_exts)
    return f"/Games/{platform}/{fmt}/{title} ({year}){ext}"

def fake_movie_path():
    title = slugify(fake.sentence(nb_words=3)[:-1])
    year = random.randint(1980, 2025)
    fmt = random.choice(movie_formats)
    res = random.choice(movie_res)
    codec = random.choice(movie_codecs)
    ext = random.choice(movie_exts)
    return f"/Media/Movies/{title}.{year}.{fmt}.{res}.{codec}{ext}"

def fake_music_path():
    artist = slugify(fake.name())
    album = slugify(fake.catch_phrase())
    track_no = random.randint(1, 18)
    track_title = slugify(fake.word().title())
    fmt = random.choice(music_formats)
    ext = random.choice(music_exts)
    return f"/Media/Music/{artist}/{album}/{fmt}/{track_no:02d} - {track_title}{ext}"

generators = [fake_game_path, fake_movie_path, fake_music_path]

def main(total: int = 100_000):
    for _ in range(total):
        sys.stdout.write(random.choice(generators)() + "\n")

if __name__ == "__main__":
    total = int(sys.argv[1]) if len(sys.argv) > 1 else 100_000
    main(total)
