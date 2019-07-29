(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var GLOBAL_CLASS_INTRO = "intro";

	var SPREADSHEET_URL_PROVIDERS = "resources/data/providers.csv";
	var SPREADSHEET_URL_INGREDIENTS = "resources/data/ingredients.csv";
	var SPREADSHEET_URL_CREATIONS = "resources/data/creations.csv";

	var _map;

	var _providers;
	var _ingredients;
	var _creations;

	$(document).ready(function() {

		$("html body").addClass(GLOBAL_CLASS_INTRO);
		new SocialButtonBar();

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
					var optgroup = $("<optgroup>")
						.attr("label", "Salad Creations")
						.appendTo($("select#creations"));
					$.each(
						_creations, 
						function(index, value) {
							$(optgroup).append($("<option>").html(value.getName()));
						}
					);
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

					finish();
				}
			}
		);

		function finish()
		{

			if (!_creations || !_providers || !_ingredients) {
				return;
			}

			_map = new L.SaladMap(
				"map", 
				{
					zoomControl: !L.Browser.mobile, 
					attributionControl: false, 
					maxZoom: 9, 
					minZoom: 2, 
					worldCopyJump: true
				},
				_providers,
				_ingredients
			)
				.addLayer(L.esri.basemapLayer("Topographic"))
				.addControl(L.control.attribution({position: 'bottomleft'}))
				.on("click", onMapClick)
				.on("moveend", onExtentChange);

			if (!L.Browser.mobile) {
				L.easyButton({
					states:[
						{
							icon: "fa fa-home",
							onClick: function(btn, map){_map.zoomToMarkers();},
							title: "Full extent"
						}
					]
				}).addTo(_map);			
			}

			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);
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
		var ingredients = _ingredients;
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
						function(product) {
							return $.inArray(product, salad.getIngredients())  > -1;
						}
					).length;
				}
			);
			ingredients = $.grep(
				_ingredients, 
				function(ingredient) {
					return salad.getIngredients().indexOf(ingredient.getName()) > -1;
				}
			);

			_map.loadData(providers, ingredients);
			$("div#results-container").css("display", "flex");			
			loadResults(salad);
		} else {
			$("div#results-container").hide();			
		}

		_map.invalidateSize();

	}

	/*
	function onMarkerClick(e)
	{

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
	*/

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	function onExtentChange()
	{
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

	/*
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
	*/

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
				ingredient = $.grep(
					_ingredients, 
					function(value){return value.getName() === ingredient;}
				).shift();
				$("<li>")
					.addClass(
						"category-"+ingredient.getCategory().toLowerCase().replace("/","-")+
						(ingredient.getProviders().length ? " clickable" : "")
					)
					.append(
						ingredient.getProviders().length ?
						$("<a>")
							.append(ingredient.getName())
							.attr("href", "#") :
						$("<span>").append(ingredient.getName()+" *")
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