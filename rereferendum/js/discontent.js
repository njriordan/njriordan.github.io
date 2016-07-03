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


        var constitData
        var font = new Font("13", Font.STYLE_NORMAL,
            Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "ARIAL");
        // Create map and set up query interval
        ready(function() {
            map = new Map("map", {
                basemap: "gray",
                center: [-2.36, 51.94],
                zoom: 7,
                logo: false
            });
            var myVar = setInterval(loadJSON, 3000);

        });

        function loadJSON() {
            // retrieve latest data from Parliament
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    jsonObject = JSON.parse(xhttp.responseText);
                    data = jsonObject["data"]["attributes"];
                    createFeatureLayer(data);
                    updateCounts(data);
                }
            };
            xhttp.open("GET", "https://petition.parliament.uk/petitions/131215.json", true);
            xhttp.send();
        };

        function updateCounts(data) {
            // update total signature count variable
            var totalCount = data['signature_count'];

            // update 'Non-UK Signatures' variable
            var overseasCount = 0;
            var countryData = data['signatures_by_country'];

            for (var i = 0; i < countryData.length; i++) {
                if (countryData[i]['name'] == 'United Kingdom') {
                    overseasCount = totalCount - countryData[i].signature_count
                    break;
                };
            };

            // Update DOM
            document.getElementById("signatureCount").innerHTML = "Total Signatures: " + totalCount.toLocaleString();
            document.getElementById("overseasCount").innerHTML = "Non-UK Signatures: " + overseasCount.toLocaleString();
        }

        function addLabels(evt, lookup) {
			
            // add signature count and constituency name on hover
            var pt = evt.graphic.geometry.getCentroid()

            var areaName = new TextSymbol(evt.graphic.attributes.PCON11NM);
            areaName.setOffset(0, 7);
            areaName.setFont(font);
            var nameGraphic = new Graphic(pt, areaName);
            map.graphics.add(nameGraphic);

            var areaCount = new TextSymbol(lookup[evt.graphic.attributes.PCON11CD]);
            areaCount.setOffset(0, -7);
            areaCount.setFont(font);
            var countGraphic = new Graphic(pt, areaCount);
            map.graphics.add(countGraphic);

        }

        function dynamicStyle(evt, lookup) {
           
            var lookupId = evt.graphic.attributes.PCON11CD;
			
            var signature_count = lookup[lookupId];
			
            var range = quantize(signature_count);
			
            // Modify DOM node attribute.
            evt.node.setAttribute("data-classification", range);
			//evt.node.setAttribute("graphic-centroid",evt.graphic.geometry.getCentroid())
        };

        function createFeatureLayer(data) {

            // Construct a feature layer
            var featureLayer = new FeatureLayer("https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/PCON_2011_UK_BGC/FeatureServer/0/", {
                styling: false,
                id: "featureLayer",
                outFields: ["*"]
            });

            // Retrieve constituency data
            var response = data["signatures_by_constituency"];

            // lookup table to hold ONS Code and signature count for each constituency
            var lookupTable = {};

            // Max signature count for dynamic styling
            var max_sig_count = 0;
            var thisCount = 0;

            // iterate over constituencies to populate lookupTable and find max. signature count
            for (var i = 0; i < response.length; i++) {
                thisCount = response[i].signature_count;
                if (thisCount > max_sig_count) {
                    max_sig_count = thisCount
                };
                lookupTable[response[i].ons_code] = thisCount;
            };

            // Add dynamic styling
            if (featureLayer.surfaceType === "svg") {
				quantize = d3.scale.quantize().domain([0, max_sig_count]).range(d3.range(9));
				
                on(featureLayer, "graphic-draw", function(evt){
					dynamicStyle(evt, lookupTable, quantize)
					});
                on(featureLayer, 'mouse-over', function(evt) {
					addLabels(evt, lookupTable)
					});
                on(featureLayer, 'mouse-out', function() {
                    map.graphics.clear();
                });
            } else {
                alert("Your browser does not support SVG.\nPlease user a modern web browser that supports SVG.");
            }
            map.addLayer(featureLayer);
            return featureLayer;
        }
    })