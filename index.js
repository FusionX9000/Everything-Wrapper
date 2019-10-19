const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

const PORT = 5000 || process.env.PORT;
const URL = "http://192.168.0.107"

const urlfy = obj => {
  return Object.keys(obj)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join("&");
};

const getQuery = (query, callback) => {
  axios
    .get(`${URL}/?${urlfy(query)}`)
    .then(response => {
      callback(response.data);
    })
    .catch(err => console.log(err));
};

app.get("/", (req, res) => {
  getQuery(req.query, data => res.json(data));
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
