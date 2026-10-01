import type { Institution } from '$lib/types/person';

/** Public institutional sites; every point retains its source and precision note. */
export const institutions: Institution[] = [
	{
		"id": "abdou-moumouni-university",
		"name": "Abdou Moumouni University",
		"aliases": [
			"Université Abdou Moumouni"
		],
		"city": "Niamey",
		"country": "Niger",
		"coordinates": {
			"latitude": 13.50136111,
			"longitude": 2.09852778
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Abdou Moumouni University\", \"Country\": \"Niger\", \"Coordinate location\": \"13.50136111,2.09852778\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "ahmadu-bello-university",
		"name": "Ahmadu Bello University",
		"aliases": [],
		"city": "Zaria",
		"country": "Nigeria",
		"coordinates": {
			"latitude": 11.15,
			"longitude": 7.65
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Ahmadu Bello University\", \"Country\": \"Nigeria\", \"Coordinate location\": \"11.15,7.65\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "ardhi-university",
		"name": "Ardhi University",
		"aliases": [],
		"city": "Dar es Salaam",
		"country": "Tanzania",
		"coordinates": {
			"latitude": -6.764311,
			"longitude": 39.2120953
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Ardhi+University&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Ardhi University, Makongo Road, Makongo, Kinondoni Municipal, Dar es Salaam, Coastal Zone, 14112, Tanzania"
			},
			{
				"url": "https://www.openstreetmap.org/way/364739419",
				"label": "OpenStreetMap institutional feature",
				"quote": "Ardhi University"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 364739419,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "bielefeld-university",
		"name": "Bielefeld University",
		"aliases": [],
		"city": "Bielefeld",
		"country": "Germany",
		"coordinates": {
			"latitude": 52.0385,
			"longitude": 8.4934
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/dh-ai-african-studies-2026/blob/3e28d6c8011fea8fb68ec6049b5080daeece9d3b/src/lib/data/participants/vera-breitner.ts",
				"label": "Hannover workshop: recorded affiliation coordinates",
				"quote": "affiliation: 'Bielefeld University'; affiliationCoordinates: { latitude: 52.0385, longitude: 8.4934 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the recorded campus approximation from the workshop contributor record. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "boston-university",
		"name": "Boston University",
		"aliases": [],
		"city": "Boston",
		"country": "United States",
		"coordinates": {
			"latitude": 42.3505,
			"longitude": -71.1054
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/dh-ai-african-studies-2026/blob/3e28d6c8011fea8fb68ec6049b5080daeece9d3b/src/lib/data/participants/fallou-ngom.ts",
				"label": "Hannover workshop: recorded affiliation coordinates",
				"quote": "affiliation: 'Boston University'; affiliationCoordinates: { latitude: 42.3505, longitude: -71.1054 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the recorded campus approximation from the workshop contributor record. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "cheikh-anta-diop-university",
		"name": "Cheikh Anta Diop University",
		"aliases": [
			"UCAD",
			"Université Cheikh Anta Diop",
			"Université Cheikh Anta Diop de Dakar"
		],
		"city": "Dakar",
		"country": "Senegal",
		"coordinates": {
			"latitude": 14.686955,
			"longitude": -17.463338
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Université Cheikh Anta Diop\", \"Country\": \"Senegal\", \"Coordinate location\": \"14.686955,-17.463338\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "duke-university",
		"name": "Duke University",
		"aliases": [],
		"city": "Durham",
		"country": "United States",
		"coordinates": {
			"latitude": 36.001111111111,
			"longitude": -78.938888888889
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Duke University\", \"Country\": \"United States of America\", \"Coordinate location\": \"36.001111111111,-78.938888888889\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "ehess",
		"name": "École des hautes études en sciences sociales",
		"aliases": [
			"EHESS",
			"EHESS-Paris",
			"Maison des Sciences de l'homme - EHESS - En réhabilitation",
			"School for Advanced Studies in the Social Sciences"
		],
		"city": "Paris",
		"country": "France",
		"coordinates": {
			"latitude": 48.8501342,
			"longitude": 2.3265803
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=%C3%89cole+des+hautes+%C3%A9tudes+en+sciences+sociales&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Maison des Sciences de l'homme - EHESS - En réhabilitation, Boulevard Raspail, Quartier Notre-Dame-des-Champs, Paris 6e Arrondissement, Paris, Île-de-France, France métropolitaine, 75006, France"
			},
			{
				"url": "https://www.openstreetmap.org/way/257636665",
				"label": "OpenStreetMap institutional feature",
				"quote": "Maison des Sciences de l'homme - EHESS - En réhabilitation"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels. This is the Paris Boulevard Raspail EHESS/Maison des Sciences de l’homme site, selected because the relevant publisher biography says EHESS-Paris. The Marseille result was rejected. The OSM name includes “En réhabilitation”; this is a source label, and current occupancy/renovation status was not verified. It is not evidence that a historical appointment occupied this building.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 257636665,
			"category": "amenity",
			"featureType": "college"
		}
	},
	{
		"id": "emory-university",
		"name": "Emory University",
		"aliases": [],
		"city": "Atlanta",
		"country": "United States",
		"coordinates": {
			"latitude": 33.8004547,
			"longitude": -84.3172378
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Emory+University&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Emory University, 201, Springdale Road Northeast, Druid Hills, Atlanta, DeKalb County, Georgia, 30306, United States"
			},
			{
				"url": "https://www.openstreetmap.org/relation/14642692",
				"label": "OpenStreetMap institutional feature",
				"quote": "Emory University"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 14642692,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "freie-universitat-berlin",
		"name": "Freie Universität Berlin",
		"aliases": [
			"Free University Berlin",
			"Free University of Berlin"
		],
		"city": "Berlin",
		"country": "Germany",
		"coordinates": {
			"latitude": 52.453055555556,
			"longitude": 13.290555555556
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Free University Berlin\", \"Country\": \"Germany\", \"Coordinate location\": \"52.453055555556,13.290555555556\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "german-institute-for-global-and-area-studies",
		"name": "German Institute for Global and Area Studies",
		"aliases": [
			"GIGA"
		],
		"city": "Hamburg",
		"country": "Germany",
		"coordinates": {
			"latitude": 53.557222,
			"longitude": 9.992222
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"German Institute for Global and Area Studies\", \"Country\": \"Germany\", \"Coordinate location\": \"53.557222,9.992222\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "harvard-university",
		"name": "Harvard University",
		"aliases": [],
		"city": "Cambridge",
		"country": "United States",
		"coordinates": {
			"latitude": 42.374444,
			"longitude": -71.116944
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Harvard University\", \"Country\": \"United States of America\", \"Coordinate location\": \"42.374444, -71.116944\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "humboldt-university-of-berlin",
		"name": "Humboldt University of Berlin",
		"aliases": [
			"Humboldt-Universität Berlin",
			"Humboldt-Universität zu Berlin"
		],
		"city": "Berlin",
		"country": "Germany",
		"coordinates": {
			"latitude": 52.518055555556,
			"longitude": 13.393333333333
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Humboldt University of Berlin\", \"Country\": \"Germany\", \"Coordinate location\": \"52.518055555556,13.393333333333\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "indiana-university-bloomington",
		"name": "Indiana University Bloomington",
		"aliases": [
			"Indiana University-Bloomington"
		],
		"city": "Bloomington",
		"country": "United States",
		"coordinates": {
			"latitude": 39.1802358,
			"longitude": -86.5093526
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Indiana+University+Bloomington&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Indiana University Bloomington, East Dekist Street, Green Acres, Bloomington, Monroe County, Indiana, 47408, United States"
			},
			{
				"url": "https://www.openstreetmap.org/way/74173036",
				"label": "OpenStreetMap institutional feature",
				"quote": "Indiana University Bloomington"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 74173036,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "islamic-university-college",
		"name": "Islamic University College",
		"aliases": [
			"Islamic University College Ghana",
			"Islamic University College, Ghana"
		],
		"city": "Accra",
		"country": "Ghana",
		"coordinates": {
			"latitude": 5.655742895900232,
			"longitude": -0.11712973230672785
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Islamic University College, Ghana\", \"Country\": \"Ghana\", \"Coordinate location\": \"5.655742895900232,-0.11712973230672785\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "johannes-gutenberg-university-mainz",
		"name": "Johannes Gutenberg University Mainz",
		"aliases": [
			"Johannes Gutenberg University of Mainz",
			"Johannes Gutenberg-Universität Mainz"
		],
		"city": "Mainz",
		"country": "Germany",
		"coordinates": {
			"latitude": 49.9920396,
			"longitude": 8.2371107
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Johannes+Gutenberg+University+Mainz&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Johannes Gutenberg-Universität Mainz, Albert-Schweitzer-Straße, Zahlbach, Oberstadt, Mainz, Rheinland-Pfalz, 55128, Deutschland"
			},
			{
				"url": "https://www.openstreetmap.org/relation/8061090",
				"label": "OpenStreetMap institutional feature",
				"quote": "Johannes Gutenberg-Universität Mainz"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 8061090,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "joseph-ki-zerbo-university",
		"name": "Joseph Ki-Zerbo University",
		"aliases": [
			"University Joseph Ki-Zerbo",
			"University of Ouagadougou",
			"Université Joseph Ki-Zerbo",
			"Université de Ouagadougou"
		],
		"city": "Ouagadougou",
		"country": "Burkina Faso",
		"coordinates": {
			"latitude": 12.37722,
			"longitude": -1.50083
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University Joseph Ki-Zerbo\", \"Country\": \"Burkina Faso\", \"Coordinate location\": \"12.37722,-1.50083\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "kings-college-london",
		"name": "King's College London",
		"aliases": [],
		"city": "London",
		"country": "United Kingdom",
		"coordinates": {
			"latitude": 51.5115,
			"longitude": -0.116
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L166",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'kings-college-london'; name: 'King's College London'; city: 'London'; coordinates: { lat: 51.5115, lng: -0.116 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "kwame-nkrumah-university-of-science-and-technology",
		"name": "Kwame Nkrumah University of Science and Technology",
		"aliases": [
			"KNUST"
		],
		"city": "Kumasi",
		"country": "Ghana",
		"coordinates": {
			"latitude": 6.684903,
			"longitude": -1.570514
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Kwame Nkrumah University of Science and Technology\", \"Country\": \"Ghana\", \"Coordinate location\": \"6.684903,-1.570514\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "lasdel-niamey",
		"name": "LASDEL (Niamey)",
		"aliases": [
			"LASDEL Niger",
			"Laboratoire d'Etudes et de Recherche sur les Dynamiques Sociales et le Développement Local"
		],
		"city": "Niamey",
		"country": "Niger",
		"coordinates": {
			"latitude": 13.548915,
			"longitude": 2.096388
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Laboratoire d'Etudes et de Recherche sur les Dynamiques Sociales et le Développement Local\", \"Country\": \"Niger\", \"Coordinate location\": \"13.548915,2.096388\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "lasdel-parakou",
		"name": "LASDEL (Parakou)",
		"aliases": [
			"LASDEL Bénin",
			"Laboratoire d'Etudes et de Recherche sur les Dynamiques Sociales et le Développement Local Bénin"
		],
		"city": "Parakou",
		"country": "Benin",
		"coordinates": {
			"latitude": 9.341822504659815,
			"longitude": 2.592843961135946
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Laboratoire d'Etudes et de Recherche sur les Dynamiques Sociales et le Développement Local Bénin\", \"Country\": \"Benin\", \"Coordinate location\": \"9.341822504659815,2.592843961135946\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "leibniz-zentrum-moderner-orient",
		"name": "Leibniz-Zentrum Moderner Orient",
		"aliases": [
			"Leibniz Centre for Modern Oriental Studies",
			"Leibniz-Zentrum Moderner Orient (ZMO)",
			"ZMO",
			"ZMO Berlin"
		],
		"city": "Berlin",
		"country": "Germany",
		"coordinates": {
			"latitude": 52.427976,
			"longitude": 13.202396
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Leibniz-Zentrum Moderner Orient\", \"Country\": \"Germany\", \"Coordinate location\": \"52.427976,13.202396\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "leiden-university",
		"name": "Leiden University",
		"aliases": [
			"Université de Leyde"
		],
		"city": "Leiden",
		"country": "Netherlands",
		"coordinates": {
			"latitude": 52.157,
			"longitude": 4.481
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L60",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'leiden-university'; name: 'Leiden University'; city: 'Leiden'; coordinates: { lat: 52.157, lng: 4.481 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "les-afriques-dans-le-monde",
		"name": "Les Afriques dans le monde",
		"aliases": [],
		"city": "Pessac",
		"country": "France",
		"coordinates": {
			"latitude": 44.806666666666665,
			"longitude": -0.6311111111111111
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Les Afriques dans le monde\", \"Country\": \"France\", \"Coordinate location\": \"44.806666666666665,-0.6311111111111111\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "martin-luther-university-halle-wittenberg",
		"name": "Martin Luther University Halle-Wittenberg",
		"aliases": [
			"Martin-Luther-Universität Halle-Wittenberg",
			"University of Halle-Wittenberg"
		],
		"city": "Halle (Saale)",
		"country": "Germany",
		"coordinates": {
			"latitude": 51.48638889,
			"longitude": 11.96888889
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Halle-Wittenberg\", \"Country\": \"Germany\", \"Coordinate location\": \"51.48638889,11.96888889\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "michigan-state-university",
		"name": "Michigan State University",
		"aliases": [],
		"city": "East Lansing",
		"country": "United States",
		"coordinates": {
			"latitude": 42.7018637482531,
			"longitude": -84.48216117291386
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Michigan State University\", \"Country\": \"United States of America\", \"Coordinate location\": \"42.7018637482531,-84.48216117291386\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "missouri-state-university",
		"name": "Missouri State University",
		"aliases": [],
		"city": "Springfield",
		"country": "United States",
		"coordinates": {
			"latitude": 37.19971,
			"longitude": -93.28079
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Missouri State University\", \"Country\": \"United States of America\", \"Coordinate location\": \"37.19971,-93.28079\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "moi-university",
		"name": "Moi University",
		"aliases": [
			"Université Moi"
		],
		"city": "Eldoret",
		"country": "Kenya",
		"coordinates": {
			"latitude": 0.286,
			"longitude": 35.287
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L115",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'moi-university'; name: 'Moi University'; city: 'Eldoret'; coordinates: { lat: 0.286, lng: 35.287 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "new-york-university-abu-dhabi",
		"name": "New York University Abu Dhabi",
		"aliases": [
			"NYU Abu Dhabi"
		],
		"city": "Abu Dhabi",
		"country": "United Arab Emirates",
		"coordinates": {
			"latitude": 24.5239,
			"longitude": 54.4346
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"New York University Abu Dhabi\", \"Country\": \"United Arab Emirates\", \"Coordinate location\": \"24.5239,54.4346\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "osun-state-university",
		"name": "Osun State University",
		"aliases": [],
		"city": "Osogbo",
		"country": "Nigeria",
		"coordinates": {
			"latitude": 7.7616469,
			"longitude": 4.6012166
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Osun State University\", \"Country\": \"Nigeria\", \"Coordinate location\": \"7.7616469,4.6012166\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "quaid-i-azam-university",
		"name": "Quaid-i-Azam University",
		"aliases": [],
		"city": "Islamabad",
		"country": "Pakistan",
		"coordinates": {
			"latitude": 33.75,
			"longitude": 73.13333333
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Quaid-i-Azam University\", \"Country\": \"Pakistan\", \"Coordinate location\": \"33.75,73.13333333\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "sol-plaatje-university",
		"name": "Sol Plaatje University",
		"aliases": [],
		"city": "Kimberley",
		"country": "South Africa",
		"coordinates": {
			"latitude": -28.74511818,
			"longitude": 24.76427601
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Sol Plaatje University\", \"Country\": \"South Africa\", \"Coordinate location\": \"-28.74511818,24.76427601\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "sorbonne-nouvelle-university",
		"name": "Sorbonne Nouvelle University",
		"aliases": [
			"Sorbonne Nouvelle-Paris 3",
			"Université Sorbonne Nouvelle",
			"Université Sorbonne Nouvelle – Paris 3"
		],
		"city": "Paris",
		"country": "France",
		"coordinates": {
			"latitude": 48.84488888888889,
			"longitude": 2.396988888888889
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Sorbonne Nouvelle-Paris 3\", \"Country\": \"France\", \"Coordinate location\": \"48.84488888888889,2.396988888888889\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "uin-sunan-kalijaga-yogyakarta",
		"name": "UIN Sunan Kalijaga Yogyakarta",
		"aliases": [
			"Sunan Kalijaga Islamic University",
			"Sunan Kalijaga State Islamic University"
		],
		"city": "Yogyakarta",
		"country": "Indonesia",
		"coordinates": {
			"latitude": -7.784758110931052,
			"longitude": 110.39435184060227
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Sunan Kalijaga Islamic University\", \"Country\": \"Indonesia\", \"Coordinate location\": \"-7.784758110931052,110.39435184060227\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "universidade-federal-de-santa-catarina",
		"name": "Universidade Federal de Santa Catarina",
		"aliases": [],
		"city": "Florianópolis",
		"country": "Brazil",
		"coordinates": {
			"latitude": -27.6011,
			"longitude": -48.52
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Universidade Federal de Santa Catarina\", \"Country\": \"Brazil\", \"Coordinate location\": \"-27.6011,-48.52\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "universite-alassane-ouattara",
		"name": "Université Alassane Ouattara",
		"aliases": [
			"Alassane Ouattara University",
			"Université de Bouaké"
		],
		"city": "Bouaké",
		"country": "Côte d’Ivoire",
		"coordinates": {
			"latitude": 7.68642,
			"longitude": -5.06669
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Université Alassane Ouattara\", \"Country\": \"Ivory Coast\", \"Coordinate location\": \"7.68642,-5.06669\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "universite-de-segou",
		"name": "Université de Ségou",
		"aliases": [
			"Ségou University",
			"University of Ségou"
		],
		"city": "Ségou",
		"country": "Mali",
		"coordinates": {
			"latitude": 13.42465383620792,
			"longitude": -6.303292125339687
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"Ségou University\", \"Country\": \"Mali\", \"Coordinate location\": \"13.42465383620792,-6.303292125339687\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "universite-de-sherbrooke",
		"name": "Université de Sherbrooke",
		"aliases": [
			"University of Sherbrooke"
		],
		"city": "Sherbrooke",
		"country": "Canada",
		"coordinates": {
			"latitude": 45.379405555556,
			"longitude": -71.927661111111
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Sherbrooke\", \"Country\": \"Canada\", \"Coordinate location\": \"45.379405555556,-71.927661111111\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "universite-laval",
		"name": "Université Laval",
		"aliases": [
			"Laval University"
		],
		"city": "Québec",
		"country": "Canada",
		"coordinates": {
			"latitude": 46.7811677,
			"longitude": -71.2741361
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Universit%C3%A9+Laval&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Université Laval, 2325, Rue de l'Université, Cité-Universitaire, Sainte-Foy–Sillery–Cap-Rouge, Québec, Agglomération de Québec, Capitale-Nationale, Québec, G1V 0A6, Canada"
			},
			{
				"url": "https://www.openstreetmap.org/relation/21100815",
				"label": "OpenStreetMap institutional feature",
				"quote": "Université Laval"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 21100815,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "universite-paris-1-pantheon-sorbonne",
		"name": "Université Paris 1 Panthéon-Sorbonne",
		"aliases": [],
		"city": "Paris",
		"country": "France",
		"coordinates": {
			"latitude": 48.8473977,
			"longitude": 2.3455085
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Universit%C3%A9+Paris+1+Panth%C3%A9on-Sorbonne&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Université Paris 1 Panthéon-Sorbonne, 2, Rue Cujas, Quartier de la Sorbonne, Paris 5e Arrondissement, Paris, Île-de-France, France métropolitaine, 75005, France"
			},
			{
				"url": "https://www.openstreetmap.org/way/791935185",
				"label": "OpenStreetMap institutional feature",
				"quote": "Université Paris 1 Panthéon-Sorbonne"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 791935185,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-alberta",
		"name": "University of Alberta",
		"aliases": [
			"Université de l’Alberta"
		],
		"city": "Edmonton",
		"country": "Canada",
		"coordinates": {
			"latitude": 53.5232,
			"longitude": -113.5263
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L12",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-alberta'; name: 'University of Alberta'; city: 'Edmonton'; coordinates: { lat: 53.5232, lng: -113.5263 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-arizona",
		"name": "University of Arizona",
		"aliases": [],
		"city": "Tucson",
		"country": "United States",
		"coordinates": {
			"latitude": 32.231667,
			"longitude": -110.951944
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Arizona\", \"Country\": \"United States of America\", \"Coordinate location\": \"32.231667, -110.951944\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-bayreuth",
		"name": "University of Bayreuth",
		"aliases": [
			"Universität Bayreuth",
			"Université de Bayreuth"
		],
		"city": "Bayreuth",
		"country": "Germany",
		"coordinates": {
			"latitude": 49.92885,
			"longitude": 11.5859
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Bayreuth\", \"Country\": \"Germany\", \"Coordinate location\": \"49.92885,11.5859\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-cape-town-libraries",
		"name": "University of Cape Town Libraries",
		"aliases": [
			"Bibliothèques de l’Université du Cap"
		],
		"city": "Cape Town",
		"country": "South Africa",
		"coordinates": {
			"latitude": -33.9577,
			"longitude": 18.4612
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L155",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-cape-town-libraries'; name: 'University of Cape Town Libraries'; city: 'Cape Town'; coordinates: { lat: -33.9577, lng: 18.4612 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-copenhagen",
		"name": "University of Copenhagen",
		"aliases": [],
		"city": "Copenhagen",
		"country": "Denmark",
		"coordinates": {
			"latitude": 55.679722222222,
			"longitude": 12.5725
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Copenhagen\", \"Country\": \"Denmark\", \"Coordinate location\": \"55.679722222222,12.5725\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-dar-es-salaam",
		"name": "University of Dar es Salaam",
		"aliases": [],
		"city": "Dar es Salaam",
		"country": "Tanzania",
		"coordinates": {
			"latitude": -6.7800162,
			"longitude": 39.2052106
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Dar+es+Salaam&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "University of Dar es Salaam, Chief Kunambi Street, Chuo Kikuu, Ubungo, Ubungo Municipal, Dar es Salaam, Coastal Zone, 14112, Tanzania"
			},
			{
				"url": "https://www.openstreetmap.org/way/798357475",
				"label": "OpenStreetMap institutional feature",
				"quote": "University of Dar es Salaam"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 798357475,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-florida",
		"name": "University of Florida",
		"aliases": [
			"Université de Floride"
		],
		"city": "Gainesville",
		"country": "United States",
		"coordinates": {
			"latitude": 29.6475,
			"longitude": -82.345
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Florida\", \"Country\": \"United States of America\", \"Coordinate location\": \"29.6475, -82.345\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-galway",
		"name": "University of Galway",
		"aliases": [
			"Ollscoil na Gaillimhe",
			"Ollscoil na Gaillimhe - University of Galway"
		],
		"city": "Galway",
		"country": "Ireland",
		"coordinates": {
			"latitude": 53.2936337,
			"longitude": -9.0750599
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Galway&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Ollscoil na Gaillimhe - University of Galway, University Road, Nun's Island, Cathair na Gaillimhe, County Galway, Connacht, H91 TK33, Éire / Ireland"
			},
			{
				"url": "https://www.openstreetmap.org/relation/14086715",
				"label": "OpenStreetMap institutional feature",
				"quote": "Ollscoil na Gaillimhe - University of Galway"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 14086715,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-helsinki",
		"name": "University of Helsinki",
		"aliases": [
			"Université d’Helsinki"
		],
		"city": "Helsinki",
		"country": "Finland",
		"coordinates": {
			"latitude": 60.1697,
			"longitude": 24.9501
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L20",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-helsinki'; name: 'University of Helsinki'; city: 'Helsinki'; coordinates: { lat: 60.1697, lng: 24.9501 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-ibadan",
		"name": "University of Ibadan",
		"aliases": [
			"Université d’Ibadan"
		],
		"city": "Ibadan",
		"country": "Nigeria",
		"coordinates": {
			"latitude": 7.4416666666667,
			"longitude": 3.9
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Ibadan\", \"Country\": \"Nigeria\", \"Coordinate location\": \"7.4416666666667,3.9\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-illinois-urbana-champaign",
		"name": "University of Illinois Urbana-Champaign",
		"aliases": [],
		"city": "Urbana–Champaign",
		"country": "United States",
		"coordinates": {
			"latitude": 40.0761545,
			"longitude": -88.2233134
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Illinois+Urbana-Champaign&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "University of Illinois Urbana-Champaign, Champaign County, Illinois, 61801, United States"
			},
			{
				"url": "https://www.openstreetmap.org/relation/12299045",
				"label": "OpenStreetMap institutional feature",
				"quote": "University of Illinois Urbana-Champaign"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 12299045,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-kansas",
		"name": "University of Kansas",
		"aliases": [],
		"city": "Lawrence",
		"country": "United States",
		"coordinates": {
			"latitude": 38.9543,
			"longitude": -95.2558
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/dh-ai-african-studies-2026/blob/3e28d6c8011fea8fb68ec6049b5080daeece9d3b/src/lib/data/participants/james-yeku.ts",
				"label": "Hannover workshop: recorded affiliation coordinates",
				"quote": "affiliation: 'University of Kansas'; affiliationCoordinates: { latitude: 38.9543, longitude: -95.2558 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the recorded campus approximation from the workshop contributor record. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-luxembourg",
		"name": "University of Luxembourg",
		"aliases": [
			"Université du Luxembourg"
		],
		"city": "Esch-sur-Alzette",
		"country": "Luxembourg",
		"coordinates": {
			"latitude": 49.5042,
			"longitude": 5.9485
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L123",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-luxembourg'; name: 'University of Luxembourg'; city: 'Esch-sur-Alzette'; coordinates: { lat: 49.5042, lng: 5.9485 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-munster",
		"name": "University of Münster",
		"aliases": [
			"Universität Münster",
			"Westfälische Wilhelms-Universität Münster"
		],
		"city": "Münster",
		"country": "Germany",
		"coordinates": {
			"latitude": 51.964,
			"longitude": 7.613
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Münster\", \"Country\": \"Germany\", \"Coordinate location\": \"51.964,7.613\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-oslo",
		"name": "University of Oslo",
		"aliases": [
			"Universitetet i Oslo"
		],
		"city": "Oslo",
		"country": "Norway",
		"coordinates": {
			"latitude": 59.9414173,
			"longitude": 10.7227683
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Oslo&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Universitetet i Oslo, Sørkedalsveien, Majorstuen, Frogner, Oslo, 0368, Norge"
			},
			{
				"url": "https://www.openstreetmap.org/relation/7757342",
				"label": "OpenStreetMap institutional feature",
				"quote": "Universitetet i Oslo"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "relation",
			"id": 7757342,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-ottawa",
		"name": "University of Ottawa",
		"aliases": [
			"Université d’Ottawa"
		],
		"city": "Ottawa",
		"country": "Canada",
		"coordinates": {
			"latitude": 45.4225271,
			"longitude": -75.6833904
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Ottawa&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "University of Ottawa, 75, Laurier Avenue East, Sandy Hill, Rideau-Vanier, Ottawa, Eastern Ontario, Ontario, K1N 6N5, Canada"
			},
			{
				"url": "https://www.openstreetmap.org/way/351751481",
				"label": "OpenStreetMap institutional feature",
				"quote": "University of Ottawa"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 351751481,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-tennessee-knoxville",
		"name": "University of Tennessee, Knoxville",
		"aliases": [
			"University of Tennessee Knoxville",
			"University of Tennessee at Knoxville",
			"University of Tennessee"
		],
		"city": "Knoxville",
		"country": "United States",
		"coordinates": {
			"latitude": 35.9516352,
			"longitude": -83.9308819
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=University+of+Tennessee+Knoxville&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "University of Tennessee, Knoxville, Third Creek Greenway, Fort Sanders, Knoxville, Knox County, East Tennessee, Tennessee, 37996, United States"
			},
			{
				"url": "https://www.openstreetmap.org/way/376167113",
				"label": "OpenStreetMap institutional feature",
				"quote": "University of Tennessee, Knoxville"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels. The publication identifies the University of Tennessee Department of Religious Studies without naming a campus; Knoxville is used as the representative institutional campus, not as separately proved evidence of the historical office or appointment location.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "way",
			"id": 376167113,
			"category": "amenity",
			"featureType": "university"
		}
	},
	{
		"id": "university-of-the-gambia",
		"name": "University of the Gambia",
		"aliases": [
			"Université de Gambie"
		],
		"city": "Faraba Banta",
		"country": "The Gambia",
		"coordinates": {
			"latitude": 13.2811,
			"longitude": -16.5833
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L107",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-the-gambia'; name: 'University of the Gambia'; city: 'Faraba Banta'; coordinates: { lat: 13.2811, lng: -16.5833 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-the-witwatersrand",
		"name": "University of the Witwatersrand",
		"aliases": [
			"Université du Witwatersrand"
		],
		"city": "Johannesburg",
		"country": "South Africa",
		"coordinates": {
			"latitude": -26.1929,
			"longitude": 28.0305
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L74",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-the-witwatersrand'; name: 'University of the Witwatersrand'; city: 'Johannesburg'; coordinates: { lat: -26.1929, lng: 28.0305 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-wisconsin-madison",
		"name": "University of Wisconsin–Madison",
		"aliases": [
			"University of Wisconsin-Madison",
			"Université du Wisconsin–Madison"
		],
		"city": "Madison",
		"country": "United States",
		"coordinates": {
			"latitude": 43.075278,
			"longitude": -89.409722
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json",
				"label": "REMOBOKO project collaborator data: recorded institutional location",
				"quote": "{\"Affiliation\": \"University of Wisconsin–Madison\", \"Country\": \"United States of America\", \"Coordinate location\": \"43.075278, -89.409722\"}"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the coordinates from the REMOBOKO project’s institutional affiliation record. Publication precision is not a claim of surveying accuracy. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "university-of-yaounde-i",
		"name": "University of Yaoundé I",
		"aliases": [
			"University of Yaounde 1",
			"University of Yaoundé 1",
			"Université de Yaoundé 1",
			"Université de Yaoundé I"
		],
		"city": "Yaoundé",
		"country": "Cameroon",
		"coordinates": {
			"latitude": 3.8669,
			"longitude": 11.5004
		},
		"sources": [
			{
				"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/affiliations.ts#L36",
				"label": "STIAS workshop: stored affiliation campus coordinates",
				"quote": "id: 'university-of-yaounde-1'; name: 'University of Yaoundé I'; city: 'Yaoundé'; coordinates: { lat: 3.8669, lng: 11.5004 }"
			}
		],
		"coordinateNote": "Sourced institutional/campus approximation, not independently re-geocoded. Copied without changing the point from the workshop’s explicit campus-location registry; distributed and personal work-location entries were excluded. The point represents the cited institution’s site, not a person’s home or real-time location."
	},
	{
		"id": "uppsala-university",
		"name": "Uppsala University",
		"aliases": [
			"Université d’Uppsala",
			"Uppsala universitet"
		],
		"city": "Uppsala",
		"country": "Sweden",
		"coordinates": {
			"latitude": 59.8576363,
			"longitude": 17.6294616
		},
		"sources": [
			{
				"url": "https://nominatim.openstreetmap.org/search?q=Uppsala+University&format=jsonv2&addressdetails=1&limit=3",
				"label": "Nominatim institutional search, queried 2026-10-01",
				"quote": "Uppsala universitet, Sankt Olofsgatan, Främre Luthagen, Fjärdingen, Uppsala, Uppsala kommun, Uppsala län, 753 11, Sverige"
			},
			{
				"url": "https://www.openstreetmap.org/node/6539308336",
				"label": "OpenStreetMap institutional feature",
				"quote": "Uppsala universitet"
			}
		],
		"coordinateNote": "Representative institutional footprint or campus point returned by OpenStreetMap/Nominatim on 2026-10-01. Reviewed for institution identity and expected city; it does not identify a particular office, appointment location, home, or a person’s physical whereabouts. The point represents the mapped feature and may be central to multiple institutional parcels.",
		"coordinateQueriedOn": "2026-10-01",
		"coordinateSourceKind": "reviewed-institutional-osm-feature",
		"osmFeature": {
			"type": "node",
			"id": 6539308336,
			"category": "amenity",
			"featureType": "university"
		}
	}
];
