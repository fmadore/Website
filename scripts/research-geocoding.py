import json, pathlib, urllib.request, urllib.parse, time
names = ["Addis Ababa University","Addis Ababa University, Institute of Ethiopian Studies","Ardhi University","British Institute of Eastern Africa","British School at Athens","Council on Foreign Relations","Emory University","Indiana University Bloomington","Institut de recherche pour le développement","Institut des mondes africains (IMAF)","Institute of History, Polish Academy of Sciences","Jagiellonian University","Johannes Gutenberg University Mainz","LLACAN, Centre national de la recherche scientifique","Nelson Mandela University","South African Centre for Digital Language Resources","South African Centre for Digital Language Resources (SADiLaR)","Tokyo Christian University","University of Dar es Salaam","University of Ebolowa","University of Galway","University of Illinois Urbana-Champaign","University of Oslo","University of Ottawa","University of Regensburg","Université Laval","Université Paris 1 Panthéon-Sorbonne","Université de Nouadhibou","Uppsala University","École des hautes études en sciences sociales","University of Tennessee Knoxville"]
results = []
for name in names:
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q":name,"format":"jsonv2","addressdetails":1,"limit":3})
    entry = {"institution": name, "sourceUrl":url}
    try:
        request = urllib.request.Request(url, headers={"User-Agent":"Website affiliation map research (https://github.com/fmadore/Website)"})
        with urllib.request.urlopen(request, timeout=20) as r: entry["candidates"] = json.load(r)
    except Exception as error: entry["error"] = str(error)
    results.append(entry)
    time.sleep(1.1)
pathlib.Path("geocoding-candidates.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
print("Institution queries:",len(results))
