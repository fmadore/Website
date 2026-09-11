#!/usr/bin/env python3
"""Re-subset the self-hosted latin-ext and vietnamese webfont files.

Why
---
The ten files in ``static/fonts/web`` named ``*-latin-ext.woff2`` and
``*-vietnamese.woff2`` come from Google Fonts, subset to Google's own
``unicode-range`` partitions. Those partitions are drawn for the whole web:
the latin-ext files carry Latin Extended-A and -B entire, plus punctuation,
currency symbols and letterlike forms that this site has never printed. A
reader on ``/publications`` downloads a 61 KB Newsreader latin-ext file for one
``ł`` (Błoch).

This script re-subsets each file to whole Unicode *blocks* rather than to the
characters currently in the corpus: a name added to the data tomorrow must not
render as tofu because a build forgot to rerun this. The block set is the
narrow, block-safe one — Latin Extended-A/B, the spacing modifier letters the
site prints (``ʿ``), the combining diacritics and Latin Extended Additional —
and it is always a *subset* of the range the CSS already declares, so no
codepoint changes which file serves it.

Regenerating
------------
Fonts change about once a year. This is not part of ``prebuild``; run it by
hand after replacing a file in ``static/fonts/web``, and commit the result::

    C:/Users/frede/AppData/Local/Programs/Python/Python312/python.exe \\
        scripts/subset-fonts.py

CI runs the same script with ``--check`` (``npm run check:fonts``), which
re-subsets every file into memory and fails if the bytes on disk differ. Run
``--check`` locally before committing.

The ``unicode-range`` declarations in ``src/app.html`` must agree with
``TARGETS`` below; ``--check`` verifies that too, and prints the declaration it
expects so a mismatch can be pasted straight in.

Requires fontTools (>= 4.60) and brotli. Use the x64 Python 3.12 install; the
ARM64 one has neither.
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

# The comments and the printed unicode-range notes carry accented characters;
# a Windows console defaults to cp1252 and would raise on them.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "static" / "fonts" / "web"
APP_HTML = ROOT / "src" / "app.html"

# Codepoint sets, as (first, last) inclusive pairs. Each set is a strict subset
# of the range Google declares for that partition, so narrowing a file can only
# remove a codepoint from it — never move one between faces, which would change
# which file a page downloads.
#
# latin-ext keeps:
#   U+0100-024F  Latin Extended-A and -B (every accented letter in a name)
#   U+02B0-02FF  spacing modifier letters (ʿ, the ayn the site typesets)
#   U+0304/0308/0329  the three combining marks Google's own partition lists
#   U+1E00-1E9F, U+1EF2-1EFF  Latin Extended Additional, minus the Vietnamese
#                             block below, which the vietnamese face owns
# and drops IPA extensions, phonetic extensions, Latin Extended-C and -D,
# currency symbols, the dagger and the letterlike forms.
#
# vietnamese is Google's partition verbatim: the site prints the Yoruba
# underdots (ẹ, ọ) and tilde-i (ĩ) that live in it, so it stays whole.
TARGETS: dict[str, tuple[tuple[int, int], ...]] = {
    "latin-ext": (
        (0x0100, 0x024F),
        (0x02B0, 0x02BA),
        (0x02BD, 0x02C5),
        (0x02C7, 0x02CC),
        (0x02CE, 0x02D7),
        (0x02DD, 0x02FF),
        (0x0304, 0x0304),
        (0x0308, 0x0308),
        (0x0329, 0x0329),
        (0x1E00, 0x1E9F),
        (0x1EF2, 0x1EFF),
    ),
    "vietnamese": (
        (0x0102, 0x0103),
        (0x0110, 0x0111),
        (0x0128, 0x0129),
        (0x0168, 0x0169),
        (0x01A0, 0x01A1),
        (0x01AF, 0x01B0),
        (0x0300, 0x0301),
        (0x0303, 0x0304),
        (0x0308, 0x0309),
        (0x0323, 0x0323),
        (0x0329, 0x0329),
        (0x1EA0, 0x1EF9),
        (0x20AB, 0x20AB),
    ),
}

# Space and no-break space are in every Google partition and cost nothing; a
# face without them can break word-spacing when it is the one serving a run.
ALWAYS = ((0x0020, 0x0020), (0x00A0, 0x00A0))

# Shaping only. Kerning and mark attachment are what make a stacked diacritic
# sit correctly; ccmp/locl/liga/rlig are required for correct text. Everything
# else Google ships (tnum, calt, frac, stylistic sets) applies to characters
# these files no longer contain.
LAYOUT_FEATURES = ["ccmp", "kern", "liga", "locl", "mark", "mkmk", "rlig"]


def subset_options() -> subset.Options:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = list(LAYOUT_FEATURES)
    options.notdef_outline = True
    options.recalc_bounds = False
    options.recalc_timestamp = False
    # The OFL licence text lives in the name table; keep every record.
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    # Variable axes stay: the CSS animates wght (400-900) and wdth (100-125).
    options.retain_gids = False
    return options


def unicodes_for(partition: str) -> list[int]:
    codepoints: set[int] = set()
    for first, last in TARGETS[partition] + ALWAYS:
        codepoints.update(range(first, last + 1))
    return sorted(codepoints)


def css_unicode_range(partition: str) -> str:
    """The `unicode-range` declaration matching a partition's target set."""
    parts = []
    for first, last in TARGETS[partition]:
        parts.append(f"U+{first:04X}" if first == last else f"U+{first:04X}-{last:04X}")
    return ", ".join(parts)


def partition_of(path: Path) -> str | None:
    for partition in TARGETS:
        if path.name.endswith(f"-{partition}.woff2"):
            return partition
    return None


def build(path: Path, partition: str) -> bytes:
    font = TTFont(path, recalcBBoxes=False, recalcTimestamp=False)
    subsetter = subset.Subsetter(options=subset_options())
    subsetter.populate(unicodes=unicodes_for(partition))
    subsetter.subset(font)
    buffer = io.BytesIO()
    font.flavor = "woff2"
    font.save(buffer)
    font.close()
    return buffer.getvalue()


def declared_ranges(html: str) -> dict[str, set[str]]:
    """Every `unicode-range` declared next to a latin-ext/vietnamese src."""
    found: dict[str, set[str]] = {partition: set() for partition in TARGETS}
    for block in re.findall(r"@font-face\s*\{(.*?)\}", html, re.S):
        src = re.search(r"fonts/web/([a-z0-9-]+)\.woff2", block)
        rng = re.search(r"unicode-range:\s*([^;]+);", block, re.S)
        if not src or not rng:
            continue
        partition = partition_of(Path(f"{src.group(1)}.woff2"))
        if partition:
            found[partition].add(re.sub(r"\s+", " ", rng.group(1)).strip())
    return found


def check_css() -> list[str]:
    problems: list[str] = []
    html = APP_HTML.read_text(encoding="utf8")
    for partition, ranges in declared_ranges(html).items():
        expected = css_unicode_range(partition)
        for declared in sorted(ranges):
            if declared != expected:
                problems.append(
                    f"{APP_HTML.relative_to(ROOT)} declares for {partition}:\n"
                    f"    {declared}\n  expected:\n    {expected}"
                )
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if a file on disk differs from what this script would write",
    )
    args = parser.parse_args()

    files = sorted(
        path for path in FONT_DIR.glob("*.woff2") if partition_of(path) is not None
    )
    if not files:
        print(f"no latin-ext/vietnamese fonts under {FONT_DIR}", file=sys.stderr)
        return 1

    stale: list[str] = []
    total_before = total_after = 0
    for path in files:
        partition = partition_of(path)
        assert partition is not None
        before = path.stat().st_size
        data = build(path, partition)
        total_before += before
        total_after += len(data)
        if args.check:
            if path.read_bytes() != data:
                stale.append(f"{path.name} ({before:,} B on disk, {len(data):,} B expected)")
        else:
            path.write_bytes(data)
            delta = len(data) - before
            print(f"  {path.name}: {before:,} → {len(data):,} B ({delta:+,})")

    stale.extend(check_css())

    if args.check:
        if stale:
            print(
                "fonts are stale; rerun scripts/subset-fonts.py:\n"
                + "\n".join(f"  - {reason}" for reason in stale),
                file=sys.stderr,
            )
            return 1
        print(f"fonts: {len(files)} subsets are current ({total_after:,} B)")
    else:
        print(f"fonts: {total_before:,} → {total_after:,} B ({total_after - total_before:+,})")
        for partition in TARGETS:
            print(f"  unicode-range for {partition}: {css_unicode_range(partition)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
