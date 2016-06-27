require([
		"esri/map",
		"esri/request",
		"esri/layers/FeatureLayer",

		"esri/symbols/TextSymbol",
		"esri/symbols/Font",
		"esri/graphic",		
		"dojo/dom",
		"dojo/on",
		"dojo/parser",
		"dojo/ready",
		"dijit/layout/BorderContainer", "dijit/layout/ContentPane"
	],
	function(
		Map,
		esriRequest,
		FeatureLayer,		
		TextSymbol,
		Font,
		Graphic,
		dom, on, parser, ready
	) {
		parser.parse();
		ready(function() {
			map = new Map("map", {
				basemap: "gray",
				center: [-3.84, 53.84],
				zoom: 6,
				logo: false
			});
			var myVar = setInterval(loadJSON, 1000);
		});
		var constitData
		var font = new Font("13", Font.STYLE_NORMAL,
			Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "ARIAL");
		function loadJSON() {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					jsonObject = JSON.parse(xhttp.responseText);
					data = jsonObject["data"]["attributes"];
					createFeatureLayer(data)
					updateCounts(data)
				}
			};
			xhttp.open("GET", "https://petition.parliament.uk/petitions/131215.json", true);
			xhttp.send();
		};
		function updateCounts(data) {
			totalCount = data['signature_count']
			overseasCount = 0
			countryData = data['signatures_by_country']
			for (var i = 0; i < countryData.length; i++) {
				if (countryData[i]['name'] == 'United Kingdom') {
					console.log('found UK')
					console.log(countryData[i]['name'])
					overseasCount = totalCount - countryData[i].signature_count
					break;
				};
			};
			document.getElementById("signatureCount").innerHTML = "Total Signatures: " + totalCount.toLocaleString()
			document.getElementById("overseasCount").innerHTML = "Non-UK Signatures: " + overseasCount.toLocaleString()
		}
		function createFeatureLayer(data) {
			var featureLayer = new FeatureLayer("https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/PCON_2011_UK_BGC/FeatureServer/0/", {
				styling: false,
				id: "featureLayer",
				outFields: ["*"]
			});
			response = data["signatures_by_constituency"]
			var lookupTable = {}
			var max_sig_count = 0
			for (var i = 0; i < response.length; i++) {
				index = response[i].signature_count
				if (index > max_sig_count) {
					max_sig_count = index
				};
				lookupTable[response[i].ons_code] = index
			};
			if (featureLayer.surfaceType === "svg") {
				// construct a linear quantitative scale with a discrete output range
				// A scales input domain is the range of possible input data values
				quantize = d3.scale.quantize().domain([0, max_sig_count]).range(d3.range(9));
				on(featureLayer, "graphic-draw", function(evt) {
					var lookupId = evt.graphic.attributes.PCON11CD;
					signature_count = lookupTable[lookupId]
					range = quantize(signature_count);
					evt.node.setAttribute("data-classification", range);
				});
				on(featureLayer, 'mouse-over', function(evt) {
					var pt = evt.graphic.geometry.getCentroid()
					var areaName = new TextSymbol(evt.graphic.attributes.PCON11NM)
					areaName.setOffset(0, 7)
					areaName.setFont(font)
					var graphic = new Graphic(pt, areaName)
					map.graphics.add(graphic)
					var areaCount = new TextSymbol(lookupTable[evt.graphic.attributes.PCON11CD])
					areaCount.setOffset(0, -7)
					areaCount.setFont(font)
					var graphic = new Graphic(pt, areaCount)
					map.graphics.add(graphic)
				});
				on(featureLayer, 'mouse-out', function(evt) {
					map.graphics.clear()
				});
			} else {
				alert("Your browser does not support SVG.\nPlease user a modern web browser that supports SVG.");
				dom.byId("legend").innerHTML = "Your browser does not support SVG.";
			}
			map.addLayer(featureLayer);
			return featureLayer;
		}
	})