function Provider(json, index)
{
	this._id = index;
	this._json = json;
}

Provider.prototype.getID = function()
{
	return this._id;
};

Provider.prototype.getName = function()
{
	return this._json.Name;
};

Provider.prototype.getCity = function()
{
	return this._json.City;	
};

Provider.prototype.getState = function()
{
	return this._json.State;
}

Provider.prototype.getLatLng = function()
{
	return L.latLng(this._json.Lat, this._json.Long);
};

Provider.prototype.getProducts = function()
{
	return this._json.Ingredients.split(",");
};

Provider.prototype.getCategory = function()
{
	return this._json.Category;
};