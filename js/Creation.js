function Creation(json, index)
{
	this._id = index;
	this._json = json;
}

Creation.prototype.getID = function()
{
	return this._id;
};

Creation.prototype.getName = function()
{
	return this._json.Name;
};

Creation.prototype.getIngredients = function()
{
	return this._json.Ingredients.split(",");
};