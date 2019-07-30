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
                    $("<a>")
                        .append(ingredient.getName())
                        .attr("href", "#") :
                    $("<span>").append(ingredient.getName()+" *")
                )
                .appendTo($(ul));				
        }
    );

    $(ul).find("li a").click(
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
        
};

Table.prototype.clearSelected = function()
{
    $(this._ul).children("li").removeClass("selected");
};