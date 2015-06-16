var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
  "development" : {
    "path" : rootPath,
    "db" : {
      "host" : "localhost",
      "port" : 8889,
      "username" : "root",
      "password" : "root",
      "dialect" : "mysql",
      "dbname" : "vtms-local"
    },
    "port" : process.env.PORT || 3030
  },
  
  "production" : {
    "path" : rootPath,
    "db" : {
      "host" : "hmvtms.db.5770926.hostedresource.com",
      "username" : "hmvtms",
      "password" : "ketchup100%OK",
      "dialect" : "mysql",
      "dbname" : "hmvtms"
    },
    "port" : process.env.PORT || 80
  }
};