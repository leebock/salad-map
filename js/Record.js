function Record(json, index)
{
	this._id = index;
	this._json = json;
}

Record.prototype.getID = function()
{
	return this._id;
};

Record.prototype.getTitle = function()
{
	return this._json.Location;
};

Record.prototype.getText = function()
{
	return this._json.Text;
};

Record.prototype.getHint = function()
{
	return this._json.Hint;
};

Record.prototype.getExclamation = function()
{
	return this._json.Exclamation;
};

Record.prototype.getImageURL = function()
{
	return this._json["Image-URL"];
};

Record.prototype.getLatLng = function()
{
	return L.latLng(this._json.Lat, this._json.Long);
};