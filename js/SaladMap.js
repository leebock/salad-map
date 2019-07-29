L.SaladMap = L.Map.extend({


  initialize: function(div, options, providers, ingredients)
  {

    L.Map.prototype.initialize.call(this, div, options);

    this._ICONS = {
      "Fruit/Vegetable": L.AwesomeMarkers.icon({markerColor: 'green'}),
      "Dairy": L.AwesomeMarkers.icon({markerColor: 'orange'}),
      "Other": L.AwesomeMarkers.icon({markerColor: 'darkred'})
    };

    this._layerLines = L.featureGroup().addTo(this);

    this._layerMarkers = L.featureGroup()
      .addTo(this)
      .on("click", onMarkerClick);

    this.loadData(providers, ingredients);
    this.zoomToMarkers();

    var self = this;

    function onMarkerClick(e)
    {

      $(".leaflet-tooltip").remove();

      var provider = $.grep(
        self._providers, 
        function(value){return value.getID() === e.layer.key;}
      ).shift();

      var ingredients = self._ingredients;

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
        .openOn(self);    

    }


  },

  /*************************************************/
  /******************* METHODS *********************/
  /*************************************************/

  loadData: function(providers, ingredients)
  {
    this._providers = providers;
    this._ingredients = ingredients;
    this._loadMarkers(this._providers);
    this._loadLines(this._providers);
    this.zoomToMarkers();
  },

  zoomToMarkers: function()
  {
    this.fitBounds(
      this._layerMarkers.getBounds().pad(0.1)
    );    
  },

  /*************************************************/
  /************* "PRIVATE" FUNCTIONS ***************/
  /*************************************************/

  _loadMarkers: function(providers)
  {

    this._layerMarkers.clearLayers();
    var self = this;
    $.each(
      providers, 
      function(index, record) {

        L.marker(
          record.getLatLng(), 
          {
            icon: self._ICONS[record.getCategory()],
            riseOnHover: true
          }
        )
          .bindTooltip(record.getName())
          .addTo(self._layerMarkers)
          .key = record.getID();

      }
    );

  },

  _loadLines: function(providers)
  {
    var self = this;
    self._layerLines.clearLayers();
    $.each(
      providers, 
      function(index, record) {
        L.polyline([record.getLatLng(), [38.896319, -77.071094]], {color: "gray", weight: 1}).addTo(self._layerLines);
      }
    );
  }

});
