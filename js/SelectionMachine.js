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

SelectionMachine.selectProvidersForCreation = function(providers, salad)
{
    return $.grep(
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
};

SelectionMachine.selectIngredientsForCreation = function(ingredients, salad)
{
    return $.grep(
        ingredients, 
        function(ingredient) {
            return salad.getIngredients().indexOf(ingredient.getName()) > -1;
        }
    );    
};