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
    this._zoomToMarkers();

    var self = this;

    function onMarkerClick(e)
    {

      $(".leaflet-tooltip").remove();

      var provider = $.grep(
        self._providers, 
        function(value){return value.getID() === e.layer.key;}
      ).shift();

      var ingredients = self._ingredients;

      /*
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
      */

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

      /*
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
      */

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
  },

  /*************************************************/
  /************* "PRIVATE" FUNCTIONS ***************/
  /*************************************************/


  _zoomToMarkers: function()
  {
    this.fitBounds(
      this._layerMarkers.getBounds().pad(0.1)/*,
      $(window).width() > WIDTH_THRESHOLD && $("div#results-container").css("display") !== "none" ? 
        {
          paddingBottomRight: [
            $("div#results-container").outerWidth() + parseInt($("#results-container").css("right")), 
            0
          ]
        } : 
        null          
        */
    );    
  },

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

  /*
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
  */

});
