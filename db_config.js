if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();  
}

var connection = {
  connectionLimit: 10,
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'isc'
};

exports.connection = connection;