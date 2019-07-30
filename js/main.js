(function () {

	"use strict";

	var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var GLOBAL_CLASS_INTRO = "intro";

	var SPREADSHEET_URL_PROVIDERS = "resources/data/providers.csv";
	var SPREADSHEET_URL_INGREDIENTS = "resources/data/ingredients.csv";
	var SPREADSHEET_URL_CREATIONS = "resources/data/creations.csv";

	var _map;
	var _table;
	
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
				_ingredients,
				getPaddingBottomRight()
			)
				.addLayer(L.esri.basemapLayer("Topographic"))
				.addControl(L.control.attribution({position: 'bottomleft'}))
				.on("click", map_onMapClick)
				.on("providerSelect", map_onProviderSelect);

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
			
			// load combo box
			
			var optgroup = $("<optgroup>")
				.attr("label", "Salad Creations")
				.appendTo($("select#creations"));
			$.each(
				_creations, 
				function(index, value) {
					$(optgroup).append($("<option>").html(value.getName()));
				}
			);			
			$("select#creations").change(select_onChange);
			
			_table = new Table($("ul#results").get(0));
			$(_table).on("ingredientSelect", table_onIngredientSelect);
						
			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);
			
			$(window).resize(
				function(){_map.setPaddingBottomRight(getPaddingBottomRight());}
			);

		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function map_onMapClick(e)
	{
		_table.clearSelected();
	}
	
	function map_onProviderSelect(provider)
	{
		var ingredients = _ingredients;
		_table.clearSelected();
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
	
	function table_onIngredientSelect(event, ingredient) 
	{
		var provider = $.grep(
			_providers,
			function(value) {
				return $.inArray(value.getName(), ingredient.getProviders()) > -1;
			}
		).shift(); // todo: handle multiples
		_map.selectProvider(provider);		
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

			$("div#results-container").css("display", "flex");			
			$("div#results-container div#preface").html(
				"The <b>"+salad.getName()+"</b> salad "+
				"consists of the following ingredients:"
			);
			
			_table.load(
				$.grep(
					_ingredients, 
					function(value){return $.inArray(value.getName(),salad.getIngredients()) > -1;}
				)			
			);
		} else {
			$("div#results-container").hide();			
		}

		/* necessary for small screens, because map actually changes size 
			as result of expanding list div */

		_map.invalidateSize();
		_map.setPaddingBottomRight(getPaddingBottomRight());
		_map.loadData(providers, ingredients);

	}

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function getPaddingBottomRight()
	{
		var paddingBottomRight = null;
		if ($(window).width() > WIDTH_THRESHOLD && $("div#results-container").css("display") !== "none") {
		 	paddingBottomRight = 
				[
					$("div#results-container").outerWidth() + parseInt($("#results-container").css("right")), 
					0
				]; 
		}
		return paddingBottomRight;
	}

})();