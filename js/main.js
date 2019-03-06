(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";

	var SPREADSHEET_URL_PROVIDERS =  "resources/data/providers.csv";
	var SPREADSHEET_URL_INGREDIENTS =  "resources/data/ingredients.csv";

	var HILLSHADE_SERVICE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/";
	var VECTOR_BASEMAP_ID = "fc3fec26b9ef44ae95674eed0a4a92ff";

	var _map;
	var _layerMarkers;

	var _providers;
	var _ingredients;

	var _selected;

	$(document).ready(function() {

		new SocialButtonBar();
		
		_map = new L.Map(
			"map", 
			{zoomControl: !L.Browser.mobile, attributionControl: false, maxZoom: 9, minZoom: 2, worldCopyJump: true}
		)
			.addLayer(L.esri.tiledMapLayer({url: HILLSHADE_SERVICE_URL, opacity: 0.2}))			
			.addLayer(L.esri.Vector.layer(VECTOR_BASEMAP_ID))
			.addControl(L.control.attribution({position: 'bottomleft'}))
			.on("click", onMapClick)
			.on("moveend", onExtentChange);

		_layerMarkers = L.featureGroup()
			.addTo(_map)
			.on("click", onMarkerClick);

		if (!L.Browser.mobile) {
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){_map.fitBounds(_layerMarkers.getBounds());},
						title: "Full extent"
					}
				]
			}).addTo(_map);			
		}

		Papa.parse(
			SPREADSHEET_URL_INGREDIENTS, 
			{
				header: true,
				download: true,
				complete: function(data) {
					_ingredients = $.map(
						data.data, 
						function(value, index){return new Ingredient(value, index);}
					);
					$.each(_ingredients, function(index, value){console.log(value.getName());});
					finish();
				}
			}
		);

		Papa.parse(
			SPREADSHEET_URL_PROVIDERS, 
			{
				header: true,
				download: true,
				complete: function(data) {

					_providers = $.map(
						$.grep(data.data, function(value){return value.Lat && value.Long;}), 
						function(value, index){return new Provider(value, index);}
					);

					$.each(
						_providers, 
						function(index, record) {

							L.marker(
								record.getLatLng(), 
								{
									riseOnHover: true
								}
							)
								.bindTooltip(record.getName())
								.addTo(_layerMarkers)
								.key = record.getID();

						}
					);

					_map.fitBounds(_layerMarkers.getBounds());

					finish();
				}
			}
		);

		function finish()
		{

			if (!_providers || !_ingredients) {
				return;
			}


			// one time check to see if touch is being used

			$(document).one("touchstart", function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);});

		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onMapClick(e)
	{
		_selected = null;
	}

	function onMarkerClick(e)
	{
		$(".leaflet-tooltip").remove();
		_selected = $.grep(
			_providers, 
			function(value){return value.getID() === e.layer.key;}
		).shift();

		L.popup({closeButton: false, offset: L.point(0, -25)})
	    .setLatLng(_selected.getLatLng())
	    .setContent(
	    	"<b>"+_selected.getName()+"</b>"+
	    	"<br />"+
	    	$.map(
		    	$.grep(
		    		_ingredients, 
		    		function(ingredient) {
		    			return $.inArray(_selected.getName(), ingredient.getProviders()) > -1;
		    		}
		    	),
		    	function(value){return value.getName();}
	    	)
	    )
	    .openOn(_map);		

	}

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	function onExtentChange()
	{
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

})();