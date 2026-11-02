# Digital humanities and software

How the site files its standalone applications beside its digital humanities
projects, and why. Decided for
[fmadore/Website#187](https://github.com/fmadore/Website/issues/187)
on 2 November 2026, when Kalamu joined Live Translation and Subtitles as the
second Windows app.

## The decision

**One section, two groups.** `/digital-humanities` is titled _Digital
Humanities & Software_ and prints, in order: the featured projects, a
_Software & applications_ section (`#software`), then the catalogue of
digital humanities projects. The navigation item is _Digital Humanities &
Software_ (_DH & Software_ in the navigation bar, where the full name pushed the
theme toggle off a 1280px header), with _All Projects & Software_ and
_Software & Applications_ (`/digital-humanities#software`) in its dropdown.

**One record per project.** An application is an ordinary record in
`src/lib/data/digital-humanities/` that carries an `application` block
(status, operating system, architectures, licence, interface languages). That
block alone files it under software (`projectGroup` in
`src/lib/utils/projectGroups.ts`); nothing is duplicated, and every record
keeps its `/digital-humanities/<id>` address. An application keeps its
methods, so a method filter on the index (`?skill=Whisper`) finds projects and
applications together, the boundary the issue asked not to force.

**One reading, everywhere.** The index, the record rail, the CV (two sections:
_Digital Humanities Projects_, _Software & Applications_), `/cv.md`, the
Markdown twins, `/api/digital-humanities.json` (each item's `group`, plus
`application`) and both MCP servers (`list_dh_projects` takes an optional
`group`) all read the group from `projectGroups.ts`.

## Why not a separate software page

A dedicated `/software` route was the alternative. With two applications it
would be a page of two entries, and it would cut each app off from the
research context it came out of (Live Translation from the STIAS workshop,
Kalamu from the AI pipelines). A section of the shared page gives the apps
their own heading, anchor and navigation entry, ahead of the long catalogue,
without moving a URL. It also costs nothing to undo: the records already say
which group they belong to.

**Revisit when** the software portfolio reaches about five applications, or
when one needs pages the record shell cannot carry (documentation, release
notes). A `/software` index would then list `projectGroup(record) ===
'software'`, while the records stay where they are, so no redirect is needed.

## Install links

A link of `type: 'install'` is where an application is obtained: its store
listing first, then any alternative (GitHub releases). The record rail makes
the first of them its button (_Install from Microsoft Store_); the CV and the
rail print them under an _Install_ key, between _Site_ and _Code_.

## Keeping the records true

Application status goes stale faster than anything else on the site: Kalamu
went from a test build to the Store in a week. Check `status`, the
architectures and the interface languages against each repository's README and
latest release when either changes. Version numbers are deliberately not
recorded.
