const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");
const path = require("path");
const helmet = require("helmet");
require("dotenv").config();

console.log(process.env.PORT);

// Permet à tout le monde d'accéder à l'API

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

// Connexion à MondoDB

mongoose
    .connect(process.env.MONGODB_URI, {
        // dbName: process.env.DB_NAME,
        // user: process.env.DB_USER,
        // pass: process.env.DB_PASS,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// mongodb+srv://Admin:admin@piquante.jaoig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// Transforme le corps de la requête en objet JavaScript

app.use(bodyParser.json());

app.use(helmet());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
