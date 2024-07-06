const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

router.get("/", async (request, response) => {
    response.render("main");
});

router.post("/consultar", (request, response) => {

    const { dato, ubicacion, fecha } = request.body;

    const columnas = "utc_timestamp, " + ubicacion + "_" + dato;

    const sql = "SELECT " + columnas + " FROM weather_data WHERE utc_timestamp LIKE '%' || ? || '%' ";

    const db = new sqlite3.Database("./database/weather_data.sqlite", (error) => {
        if (error) {
            console.error(error.message);
            response.status(500).json({ error: error.message });
            return;
        }
        console.log('Conexión a la base de datos SQLite establecida.');
    });

    db.all(sql, [fecha], (error, rows) => {
        if (error) {
            console.error(error.message);
            response.status(500).json({ error: error.message });
            return;
        }
        response.json(rows);
    });

    db.close((error) => {
        if (error)
            console.error(error.message);
        console.log('Conexión a la base de datos SQLite cerrada.');
    });

});


module.exports = router;
