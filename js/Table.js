function Table(ul)
{
    this._ul = ul;
}

Table.prototype.load = function(ingredients) {
    var ul = this._ul;
    var self = this;
    $(ul).empty();    
    $.each(
        ingredients,
        function(index, ingredient) {
            $("<li>")
                .addClass(
                    "category-"+ingredient.getCategory().toLowerCase().replace("/","-")+
                    (ingredient.getProviders().length ? " clickable" : "")
                )
                .append(
                    ingredient.getProviders().length ?
                    $("<button>").append(ingredient.getName()) :
                    $("<span>").append(ingredient.getName()+" *")
                )
                .appendTo($(ul));				
        }
    );

    $(ul).find("li button").click(
        function() {
            $(ul).children("li").removeClass("selected");
            $(this).parent().addClass("selected");
            var ingredient =  $.grep(
                ingredients, 
                function(value) {
                    return value.getName() === $(event.target).text();
                }
            ).shift(); // todo: handle multiples
            $(self).trigger("ingredientSelect", [ingredient]);
        }
    );
    
    $(ul).animate({scrollTop: 0}, 'slow');

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
                $(li).find("button").text(), 			
                $.map(
                    ingredients,
                    function(value){return value.getName();}
                )
            ) > -1;
        }
    ).shift();
    if (li) {
        $(li).addClass("selected");
        $(ul).animate({scrollTop: $(li).position().top}, 'slow');
    }
};