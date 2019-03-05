function Ingredient(json, index)
{
	this._id = index;
	this._json = json;
}

Ingredient.prototype.getID = function()
{
	return this._id;
};

Ingredient.prototype.getName = function()
{
	return this._json.Name;
};

Ingredient.prototype.getProviders = function()
{
	return this._json.Provider.split(",");	
};