function SelectionMachine(){}

SelectionMachine.selectIngredientsForProvider = function(ingredients, provider)
{
    return $.grep(
        ingredients, 
        function(ingredient) {
            return $.inArray(provider.getName(), ingredient.getProviders()) > -1;
        }
    );			    
};

SelectionMachine.selectProvidersForIngredient = function(providers, ingredient)
{
    return $.grep(
        providers,
        function(value) {
            return $.inArray(value.getName(), ingredient.getProviders()) > -1;
        }
    );    
};