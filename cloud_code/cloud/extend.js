// https://github.com/ParsePlatform/Parse-SDK-JS/pull/37
// json to Parse Query Object
Parse.Query.prototype.fromJSON = function(json) {
    var key;

    if (json.where) {
      this._where = json.where;
    }

    if (json.include) {
      this._include = json.include.split(",");
    }

    if (json.keys) {
      this._select = json.keys.split(",");
    }

    if (json.limit) {
      this._limit  = json.limit;
    }

    if (json.skip) {
      this._skip = json.skip;
    }

    if (json.order) {
      this._order = json.order.split(",");
    }

    for (key in json) if (json.hasOwnProperty(key))  {
      if (["where", "include", "keys", "limit", "skip", "order"].indexOf(key) === -1) {
        this._extraOptions[key] = json[key];
      }
    }

    return this;
}

module.exports = Parse