(function () {

	"use strict";

	var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var GLOBAL_CLASS_INTRO = "intro";

	var SPREADSHEET_URL_PROVIDERS = "resources/data/providers.csv";
	var SPREADSHEET_URL_INGREDIENTS = "resources/data/ingredients.csv";
	var SPREADSHEET_URL_CREATIONS = "resources/data/creations.csv";

	var HILLSHADE_SERVICE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/";
	var VECTOR_BASEMAP_ID = "fc3fec26b9ef44ae95674eed0a4a92ff";

	var ICONS = {
		"Fruit/Vegetable": L.AwesomeMarkers.icon({markerColor: 'green'}),
		"Dairy": L.AwesomeMarkers.icon({markerColor: 'orange'}),
		"Other": L.AwesomeMarkers.icon({markerColor: 'darkred'})
	};

	var _map;
	var _layerMarkers;

	var _providers;
	var _ingredients;
	var _creations;

	$(document).ready(function() {

		$("html body").addClass(GLOBAL_CLASS_INTRO);
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
						onClick: function(btn, map){zoomToMarkers();},
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
					zoomToMarkers();
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
		$("ul#results li").removeClass("selected");		
	}

	function select_onChange(event) {
		$("html body").removeClass(GLOBAL_CLASS_INTRO);
		_map.closePopup();
		var providers = _providers;
		var salad;
		if (event.target.value.toLowerCase() !== "all providers") {
			salad = $.grep(
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
			$("div#results-container").css("display", "flex");			
			loadResults(salad);
		} else {
			$("div#results-container").hide();			
		}

		loadMarkers(providers);
		_map.invalidateSize();
		zoomToMarkers();

	}

	function onMarkerClick(e)
	{
		$(".leaflet-tooltip").remove();
		var provider = $.grep(
			_providers, 
			function(value){return value.getID() === e.layer.key;}
		).shift();

		var ingredients = _ingredients;
		if ($("#creations").val().toLowerCase() !== "all providers") {
			var salad = $.grep(
				_creations, 
				function(value){return value.getName() === $("#creations").val();}
			).shift();
			ingredients = $.grep(
				ingredients, 
				function(ingredient) {
					return $.inArray(ingredient.getName(), salad.getIngredients()) > -1;
				}
			);
		}

		L.popup({closeButton: false, offset: L.point(0, -25)})
	    .setLatLng(provider.getLatLng())
	    .setContent(
	    	"<b>"+provider.getName()+"</b>"+
	    	"<br />"+
	    	$.map(
		    	$.grep(
		    		ingredients, 
		    		function(ingredient) {
		    			return $.inArray(provider.getName(), ingredient.getProviders()) > -1;
		    		}
		    	),
		    	function(value){return value.getName();}
	    	)
	    )
	    .openOn(_map);		

		$("ul#results li").removeClass("selected");
		$(
			$.grep(
				$("ul#results li"),
				function(li) {
					return $.inArray(
						$(li).find("a").text(), 			
				    	$.map(
					    	$.grep(
					    		ingredients, 
					    		function(ingredient) {
					    			return $.inArray(provider.getName(), ingredient.getProviders()) > -1;
					    		}
					    	),
					    	function(value){return value.getName();}
				    	)
					) > -1;
				}
			).shift()
		).addClass("selected");

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

	function zoomToMarkers()
	{
		_map.fitBounds(
			_layerMarkers.getBounds().pad(0.1),
			$(window).width() > WIDTH_THRESHOLD && $("div#results-container").css("display") !== "none" ? 
				{
					paddingBottomRight: [
						$("div#results-container").outerWidth() + parseInt($("#results-container").css("right")), 
						0
					]
				} : 
				null					
		);		
	}

	function loadMarkers(providers)
	{

		_layerMarkers.clearLayers();
		$.each(
			providers, 
			function(index, record) {

				L.marker(
					record.getLatLng(), 
					{
						icon: ICONS[record.getCategory()],
						riseOnHover: true
					}
				)
					.bindTooltip(record.getName())
					.addTo(_layerMarkers)
					.key = record.getID();

			}
		);

	}

	function loadResults(salad)
	{
		$("ul#results").empty();
		$("div#results-container div#preface").html(
			"The <b>"+salad.getName()+"</b> salad "+
			"consists of the following ingredients:"
		);

		$.each(
			salad.getIngredients(), 
			function(index, ingredient) {
				var category = $.grep(
					_ingredients, 
					function(value){return value.getName() === ingredient;}
				).shift().getCategory().toLowerCase().replace("/","-"); 
				$("<li>")
					.addClass("category-"+category)
					.append(
						$("<a>")
							.append(ingredient)
							.attr("href", "#")
					)
					.appendTo($("ul#results"));				
			}
		);

		$("ul#results li a").click(
			function(event) {
				$("ul#results li").removeClass("selected");
				$(this).parent().addClass("selected");
				var ingredient =  $.grep(
					_ingredients, 
					function(value) {
						return value.getName() === $(event.target).text();
					}
				).shift();
				var provider = $.grep(
					_providers,
					function(value) {
						return $.inArray(value.getName(), ingredient.getProviders()) > -1;
					}
				).shift(); // todo: handle multiples

				L.popup({closeButton: false, offset: L.point(0, -25)})
			    .setLatLng(provider.getLatLng())
			    .setContent(
			    	"<b>"+provider.getName()+"</b>"+
			    	"<br />"+ingredient.getName()
			    )
			    .openOn(_map);		

			}
		);


	}


})();