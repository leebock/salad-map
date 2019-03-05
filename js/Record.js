function Record(json, index)
{
	this._id = index;
	this._json = json;
}

Record.prototype.getID = function()
{
	return this._id;
};

Record.prototype.getName = function()
{
	return this._json.Name;
};

Record.prototype.getCity = function()
{
	return this._json.City;	
}

Record.prototype.getLatLng = function()
{
	return L.latLng(this._json.Lat, this._json.Long);
};