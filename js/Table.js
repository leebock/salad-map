function Table(ul)
{
    this._ul = ul;
}

Table.prototype.load = function(ingredients, providers) {
    var ul = this._ul;
    var self = this;
    $(ul).empty();    
    $.each(
        ingredients,
        function(index, ingredient) {
            var provider = SelectionMachine.selectProvidersForIngredient(
                providers, 
                ingredient
            ).shift(); /* to do: handle multiples */
            $("<li>")
                .addClass(
                    "category-"+ingredient.getCategory().toLowerCase().replace("/","-")
                )
                .append(
                    ingredient.getProviders().length ?
                    $("<button>")
                        .data("ingredient", ingredient)
                        .append($("<span>").html(ingredient.getName()))
                        .append("<br>")
                        .append($("<span>").html(
                            provider.getName()+", "+
                            provider.getCity()+", "+
                            provider.getState())
                        )
                        .click(onButtonClick) :
                    $("<span>")
                        .append($("<p>").html(ingredient.getName()+" *"))
                )
                .appendTo($(ul));				
        }
    );
    
    $(ul).animate({scrollTop: 0}, 'slow');

    function onButtonClick(event) {
        $(ul).children("li").removeClass("selected");
        $(this).parent().addClass("selected");
        $(self).trigger("ingredientSelect", [$(event.target).data("ingredient")]);
    }

};

Table.prototype.clearSelected = function()
{
    $(this._ul).children("li").removeClass("selected");
};

Table.prototype.selectIngredients = function(ingredients)
{
    this.clearSelected();
    var ul = this._ul;
    var li = $.grep(
        $(ul).children("li"),
        function(li) {
            return $.inArray(
                $(li).children("button").data("ingredient").getName(), 			
                $.map(
                    ingredients,
                    function(value){return value.getName();}
                )
            ) > -1;
        }
    ).shift();
    if (li) {
        $(li).addClass("selected");
        $(ul).animate(
            {scrollTop: $(li).offset().top - $(ul).offset().top + $(ul).scrollTop()}, 
            'slow'
        );        
    }
};