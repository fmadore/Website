import concurrent.futures, json, pathlib, urllib.request, urllib.parse
sources = json.loads(pathlib.Path("scripts/research-source-urls.json").read_text())
out = pathlib.Path("research-artifacts/sources")
out.mkdir(parents=True, exist_ok=True)
def fetch(record):
    result = {"id": record["id"], "responses": []}
    targets = []
    if record.get("doi"):
        targets += [("crossref", "https://api.crossref.org/works/" + urllib.parse.quote(record["doi"], safe="")), ("doi", "https://doi.org/" + record["doi"])]
    if record.get("url"): targets.append(("publisher", record["url"]))
    for kind, url in targets:
        entry = {"kind": kind, "requestedUrl": url}
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Academic website affiliation verification; https://github.com/fmadore/Website"})
            with urllib.request.urlopen(req, timeout=25) as response:
                body = response.read(5_000_000)
                suffix = ".json" if kind == "crossref" else ".html"
                if "pdf" in response.headers.get("Content-Type",""): suffix = ".pdf"
                filename = record["id"] + "-" + kind + suffix
                (out / filename).write_bytes(body)
                entry.update({"status": response.status, "resolvedUrl": response.url, "contentType": response.headers.get("Content-Type"), "file": filename})
        except Exception as error: entry["error"] = str(error)
        result["responses"].append(entry)
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(fetch, sources))
(out / "manifest.json").write_text(json.dumps(results, indent=2))
print("Fetched DOI/publisher evidence for",len(results),"publications")
