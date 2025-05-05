"use strict";

const { Client } = require('pg');
const express = require('express');
const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));
const PORT = 8001;
app.listen(PORT);

const cors = require('cors');
app.use(cors());

const clientConfig = {
  user: 'postgres',
  password: 'mypacepostgresql',
  host: 'assignment-2.c5qq4ak0iq9x.us-east-2.rds.amazonaws.com',
  port: 5432,
  ssl: {
     rejectUnauthorized: false,
  }
};

//country
app.get('/countries', async function (req, res) {
  const client = new Client(clientConfig);
  const query = `select * from countries`;
  await client.connect();
  const result = await client.query(query);
  res.send(result.rows);
  await client.end();
});

// airlines
app.get('/airlines/:code', async function (req, res) {
  const country_code = req.params.code;
  const client = new Client(clientConfig);
  const query = `select a.name, a.iata, a.icao, a.callsign, c.name 
                from airlines a join countries c 
                on a.country = c.name where c.code = $1`;

  await client.connect();
  const result = await client.query(query, [country_code]);
  
  if (result.rowCount < 1) {
    res.status(500).send("Internal Error - No Country Found");
  } else {
    res.set("Content-Type", "application/json");
    res.send(result.rows);
  }
  
  await client.end();
});

app.get('/airlines', async function (req, res) {
  const { iata, icao } = req.query;
  if (!iata && !icao) {
    return res.status(400).send("Bad Request - Provide at least one parameter (IATA or ICAO)");
  }
  const client = new Client(clientConfig);
  await client.connect();
    
  const result = await client.query("select * from airlines where (iata = $1::text OR icao = $2::text)", [iata, icao]);
    
  if (result.rowCount < 1) {
    res.status(500).send("Internal Error - No Airline Found");
  } else {
    res.set("Content-Type", "application/json");
    res.send(result.rows);
  }
  await client.end();
});

app.post('/airlines', async (req, res) => {
  const { name, iata, icao, callsign, country } = req.body;
  const client = new Client(clientConfig);

  try {
    if (!name || !country) {
      return res.status(400).json({
        error: "name and country are required fields"
      });
    }

    if (!iata && !icao) {
      return res.status(400).json({
        error: "at least one identifier (iata or icao) must be provided"
      });
    }

    if (iata && (!/^[a-z]{2}$/i.test(iata))) {
      return res.status(400).json({
        error: "iata code must be exactly 2 letters"
      });
    }
    if (icao && (!/^[a-z]{3}$/i.test(icao))) {
      return res.status(400).json({
        error: "icao code must be exactly 3 letters"
      });
    }

    await client.connect();

    const checkquery = `
      select iata from airlines 
      where (iata = $1 and $1 is not null)
         or (icao = $2 and $2 is not null)
      limit 1
    `;
    const checkresult = await client.query(checkquery, [
      iata ? iata : null, 
      icao ? icao : null
    ]);

    if (checkresult.rows.length > 0) {
      return res.status(409).json({
        error: "airline with this iata or icao code already exists",
        conflict: checkresult.rows[0]
      });
    }

    const insertquery = `
      insert into airlines (name, iata, icao, callsign, country)
      values ($1, $2, $3, $4, $5)
      returning *
    `;
    const result = await client.query(insertquery, [
      name,
      iata ? iata.tolowercase() : null,
      icao ? icao.tolowercase() : null,
      callsign || null,
      country
    ]);

    res.status(201).json({
      message: "airline created successfully",
      airline: result.rows[0]
    });

  } catch (error) {
    console.error("database error:", error);
    res.status(500).json({
      error: "internal server error",
      details: error.message
    });
  } finally {
    try {
      await client.end();
    } catch (enderror) {
      console.error("error closing connection:", enderror);
    }
  }
});

app.delete('/airlines', async function (req, res) {
  const { iata, icao } = req.query;
  if (!iata && !icao) {
    return res.status(400).json({ 
      error: "must provide either iata or icao code" 
    });
  }

  const client = new Client(clientConfig);
  
  try {
    await client.connect();
    const deleteresult = await client.query(
      `delete from airlines 
       where (iata = $1 or icao = $2)
       returning *`,
      [iata, icao]
    );
    
    if (deleteresult.rowcount === 0) {
      return res.status(404).json({ 
        message: "no matching airlines found" 
      });
    }
    
    res.status(200).json({ 
      message: "successfully deleted airline(s)",
      count: deleteresult.rowcount,
      deletedairlines: deleteresult.rows
    });
    
  } catch (error) {
    console.error("database error:", error);
    res.status(500).json({ 
      error: "internal server error",
      details: error.message 
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (enderror) {
        console.error("error closing connection:", enderror);
      }
    }
  }
});

//airports
app.get('/airports/:code', async function (req, res) {
  const country_code = req.params.code;
  const client = new Client(clientConfig);
  const query = `select a.name, a.city, a.country, a.icao, a.iata, a.latitude, a.longitude 
                from airports a join countries c 
                on a.country = c.name where c.code = $1`;

  await client.connect();
  const result = await client.query(query, [country_code]);
  
  if (result.rowCount < 1) {
    res.status(500).send("Internal Error - No Country Found");
  } else {
    res.set("Content-Type", "application/json");
    res.send(result.rows);
  }
  
  await client.end();
});

app.get('/airports', async function (req, res) {
  const { iata, icao } = req.query;
  if (!iata && !icao) {
    return res.status(400).send("Bad Request - Provide at least one parameter (IATA or ICAO)");
  }
  const client = new Client(clientConfig);
  await client.connect();
    
  const result = await client.query("select * from airports where (iata = $1::text OR icao = $2::text)", [iata, icao]);
    
  if (result.rowCount < 1) {
    res.status(500).send("Internal Error - No Airline Found");
  } else {
    res.set("Content-Type", "application/json");
    res.send(result.rows);
  }
  await client.end();
});

app.post('/airports', async (req, res) => {
  const { name, city, country, iata, icao, } = req.body;
  const client = new Client(clientConfig);

  try {
    if (!name || !city || !country) {
      return res.status(400).json({
        error: "Name, city, and country are required fields"
      });
    }

    if (!iata && !icao) {
      return res.status(400).json({
        error: "At least one identifier (IATA or ICAO) must be provided"
      });
    }

    if (iata && (!/^[A-Z]{3}$/.test(iata))) {
      return res.status(400).json({
        error: "IATA code must be exactly 3 uppercase letters"
      });
    }

    if (icao && (!/^[A-Z]{4}$/.test(icao))) {
      return res.status(400).json({
        error: "ICAO code must be exactly 4 uppercase letters"
      });
    }

    await client.connect();

    if (iata || icao) {
      const checkQuery = `
        select iata from airports 
        where (iata = $1 AND $1 IS NOT NULL)
           or (icao = $2 AND $2 IS NOT NULL)
        limit 1
      `;
      const checkResult = await client.query(checkQuery, [iata, icao]);

      if (checkResult.rows.length > 0) {
        return res.status(409).json({
          error: "Airport with this IATA or ICAO code already exists",
          conflict: checkResult.rows[0]
        });
      }
    }

    const insertQuery = `
      insert into airports (name, city, country, iata, icao, longitude, latitude)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `;
    const result = await client.query(insertQuery, [
      name,
      city,
      country,
      iata || null,
      icao || null,
      longitude,
      latitude
    ]);

    res.status(201).json({
      message: "Airport created successfully",
      airport: result.rows[0]
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  } finally {
    try {
      await client.end();
    } catch (endError) {
      console.error("Error closing connection:", endError);
    }
  }
});

app.delete('/airports', async function (req, res) {
  const { iata, icao } = req.query;
  if (!iata && !icao) {
    return res.status(400).json({ 
      error: "must provide either iata or icao code" 
    });
  }

  const client = new Client(clientConfig);
  
  try {
    await client.connect();
    const deleteresult = await client.query(
      `delete from airports 
       where (iata = $1 or icao = $2)
       returning *`,
      [iata, icao]
    );
    
    if (deleteresult.rowCount === 0) {
      return res.status(404).json({ 
        message: "no matching airport found" 
      });
    }
    
    res.status(200).json({ 
      message: "successfully deleted airport(s)",
      count: deleteresult.rowCount,
      deletedairports: deleteresult.rows
    });
    
  } catch (error) {
    console.error("database error:", error);
    res.status(500).json({ 
      error: "internal server error",
      details: error.message 
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (enderror) {
        console.error("error closing connection:", enderror);
      }
    }
  }
});

//routes
app.get('/routes', async(req, res) => {
  const client = new Client(clientConfig);
  try {
    await client.connect();
      const { departure, arrival } = req.query
      if (!departure || !arrival) { 
          return res.status(400).json({error: 'Both departure and arrival airport codes are required'}) 
      }
      
      const airportQuery = `
          SELECT name, iata, latitude, longitude 
          FROM airports 
          WHERE iata IN ($1, $2)
      `;
        
      const airportResult = await client.query(airportQuery, [departure.toUpperCase(), arrival.toUpperCase()])
      
      if (airportResult.rows.length !== 2) { return res.status(404).json({error: 'One or both airports not found'}) }
      
      const depAirport = airportResult.rows.find(row => row.iata.toUpperCase() === departure.toUpperCase())
      const arrAirport = airportResult.rows.find(row => row.iata.toUpperCase() === arrival.toUpperCase())
      
      const R = 6378
      const lat1 = depAirport.latitude * Math.PI / 180
      const lat2 = arrAirport.latitude * Math.PI / 180
      const lon1 = depAirport.longitude * Math.PI / 180
      const lon2 = arrAirport.longitude * Math.PI / 180
      
      const dLat = lat2 - lat1
      const dLon = lon2 - lon1
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      const routeQuery = `
          SELECT airline, planes 
          FROM routes 
          WHERE departure = $1 AND arrival = $2
      `
      const routeResult = await client.query(routeQuery, [departure, arrival])
      
      if (routeResult.rows.length === 0 ) { return res.status(500).json({error: 'Internal Server error'}) } 
      const response = {
          departure: {
              code: depAirport.iata,
              name: depAirport.name
          },
          arrival: {
              code: arrAirport.iata,
              name: arrAirport.name
          },
          distance: Math.round(distance * 100) / 100, 
          unit: 'km',
          routes: routeResult.rows.map(row => ({
              airline: row.airline,  
              aircraft_types: row.planes ? row.planes.split(' ') : []
          }))
      }
      return res.json(response)
      
  } catch (error) {
      console.log(error)
      return res.status(500).json({error: 'Internal server error'})
  }
});
