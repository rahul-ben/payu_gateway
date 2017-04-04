var config = {
    "development" : {
        "webServer": {
            "port": 3500
        }
    }
};
var node_env = process.env.NODE_ENV || 'development';

module.exports = config[node_env];