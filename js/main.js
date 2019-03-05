(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";

	var SPREADSHEET_URL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWKw3HRGX2Il-SyDcPNddVbgjsaq68edQk4pW-J1EYslkF4DqZtSU9jJGMaAjPr4sX5W_9aDLAQPWx/pub?gid=0&single=true&output=csv";
	var HILLSHADE_SERVICE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/";
	var VECTOR_BASEMAP_ID = "fc3fec26b9ef44ae95674eed0a4a92ff";

	var _map;
	var _layerMarkers;

	var _records;	
	var _selected;

	$(document).ready(function() {

		new SocialButtonBar();
		
		_map = new L.Map(
			"map", 
			{zoomControl: !L.Browser.mobile, attributionControl: false, maxZoom: 12, minZoom: 2, worldCopyJump: true}
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
			SPREADSHEET_URL, 
			{
				header: true,
				download: true,
				complete: function(data) {
					_records = $.grep(data.data, function(value){return value.Lat && value.Long;});
					_records = $.map(
						_records, 
						function(value, index){return new Record(value, index);}
					);
					finish();
				}
			}
		);

		function finish()
		{

			$.each(
				_records, 
				function(index, record) {

					L.marker(
						record.getLatLng(), 
						{
							riseOnHover: true
						}
					)
						.bindPopup(record.getTitle(), {closeButton: false})
						.bindTooltip(record.getTitle())
						.addTo(_layerMarkers)
						.key = record.getID();

				}
			);

			_map.fitBounds(_layerMarkers.getBounds());

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
			_records, 
			function(value){return value.getID() === e.layer.key;}
		).shift();
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