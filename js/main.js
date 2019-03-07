(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";

	var SPREADSHEET_URL_PROVIDERS = "resources/data/providers.csv";
	var SPREADSHEET_URL_INGREDIENTS = "resources/data/ingredients.csv";
	var SPREADSHEET_URL_CREATIONS = "resources/data/creations.csv";

	var HILLSHADE_SERVICE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/";
	var VECTOR_BASEMAP_ID = "fc3fec26b9ef44ae95674eed0a4a92ff";

	var _map;
	var _layerMarkers;

	var _providers;
	var _ingredients;
	var _creations;

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
			SPREADSHEET_URL_CREATIONS, 
			{
				header: true,
				download: true,
				complete: function(data) {
					_creations = $.map(
						data.data, 
						function(value, index){return new Creation(value, index);}
					);
					var optgroup = $("<optgroup>").attr("label", "Salad Creations").appendTo($("select#creations"));
					$.each(_creations, function(index, value){$(optgroup).append($("<option>").html(value.getName()));});
					finish();
				}
			}
		);

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

					loadMarkers(_providers);
					_map.fitBounds(_layerMarkers.getBounds());
					finish();
				}
			}
		);

		function finish()
		{

			if (!_creations || !_providers || !_ingredients) {
				return;
			}

			// one time check to see if touch is being used

			$(document).one("touchstart", function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);});
			$("select#creations").change(select_onChange);

		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onMapClick(e)
	{
	}

	function select_onChange(event) {
		var providers = _providers;
		if (event.target.value.toLowerCase() !== "all providers") {
			var salad = $.grep(
				_creations, 
				function(value){return value.getName() === event.target.value;}
			).shift();
			providers = $.grep(
				providers, 
				function(provider){
					return $.grep(
						provider.getProducts(), 
						function(product){return $.inArray(product, salad.getIngredients())  > -1;}
					).length;
				}
			);
		}
		loadMarkers(providers);
		//_map.flyToBounds(_layerMarkers.getBounds());		
	}

	function onMarkerClick(e)
	{
		$(".leaflet-tooltip").remove();
		var provider = $.grep(
			_providers, 
			function(value){return value.getID() === e.layer.key;}
		).shift();

		L.popup({closeButton: false, offset: L.point(0, -25)})
	    .setLatLng(provider.getLatLng())
	    .setContent(
	    	"<b>"+provider.getName()+"</b>"+
	    	"<br />"+
	    	$.map(
		    	$.grep(
		    		_ingredients, 
		    		function(ingredient) {
		    			return $.inArray(provider.getName(), ingredient.getProviders()) > -1;
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

	function loadMarkers(providers)
	{

		_layerMarkers.clearLayers();
		$.each(
			providers, 
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

	}

})();