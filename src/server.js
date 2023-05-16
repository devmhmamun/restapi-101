'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const shortid = require('shortid');
const fs = require('fs/promises');
const path = require('path');

const dataLocation = `${__dirname}/data.json`;
// const dataLocation = path.resolve('src', 'data.json');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

/*
 * Player Microservice
 * CRUD Operation -        Create Read Update Delete
 * GET            - /    - Find all the players
 * POST           - /    - Create a new player and save into DB
 * GET            - /:id - Find a player by ID
 * PUT            - /:id - Update/Create player
 * PATCH          - /:id - Update player
 * DELETE         - /:id - Delete player from DB
 *
 * POST, PUT & PATCH request have body
 * PATCH request is use to UPDATE specific portion of data
 * PUT request is used to UPDATE whole data
 * PUT can work like POST or PATCH request
 */

/**
 * NAMING Convension
 * GET      /products       Find all available products
 * POST     /products       Create a new product
 * GET      /products/id    Find a single product
 * PUT      /products/id    Update/create a single product
 * PATCH    /products/id    Update a single product
 * DELETE   /products/id    Delete a single product
 */

// POST request - Create players
app.post('/', async (req, res) => {
  const player = {
    ...req.body,
    id: shortid.generate(),
  };

  const data = await fs.readFile(dataLocation);
  // OR
  // const data = await fs.readFile(`${__dirname}/data.json`);

  const players = JSON.parse(data);
  console.log(players);
  players.push(player);

  await fs.writeFile(dataLocation, JSON.stringify(players));

  res.status(201).json(player);
});

// GET request - Find the players
app.get('/', async (req, res) => {
  const data = await fs.readFile(dataLocation);
  const players = JSON.parse(data);
  res.status(201).json(players);
});

// GET request - Find a player by id
app.get('/:id', async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dataLocation);
  const players = JSON.parse(data);

  const player = players.find(item => item.id === id);

  !player
    ? res.status(404).json({ message: 'Player NOT found!' })
    : res.status(200).json(player);
  // if (!player) {
  //   res.status(404).json({ message: 'Player NOT found!' });
  // } else {
  //   res.status(200).json(player);
  // }
});

// PATCH request - UPDATE specific portion of data
app.patch('/:id', async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dataLocation);
  const players = JSON.parse(data);

  const player = players.find(item => item.id === id);

  if (!player) {
    res.status(404).json({ message: 'Player NOT found!' });
  } else {
    player.name = req.body.name || player.name;
    player.country = req.body.country || player.country;
    player.rank = req.body.rank || player.rank;
  }

  await fs.writeFile(dataLocation, JSON.stringify(players));
  res.status(200).json(player);
});

// PUT request - UPDATE whole data
app.put('/:id', async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dataLocation);
  const players = JSON.parse(data);

  let player = players.find(item => item.id === id);

  if (!player) {
    player = { id: shortid.generate(), ...req.body };
    players.push(player);
  } else {
    player.name = req.body.name;
    player.country = req.body.country;
    player.status = req.body.status;
    player.rank = req.body.rank;
  }

  await fs.writeFile(dataLocation, JSON.stringify(players));
  res.status(200).json(player);
});

// DELETE - Delete player by id
app.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const data = await fs.readFile(dataLocation);
  const players = JSON.parse(data);

  let player = players.find(item => item.id === id);

  if (!player) {
    res.status(404).json({ message: 'Player NOT found!' });
  }

  const newPlayers = players.filter(item => item.id !== id);
  await fs.writeFile(dataLocation, JSON.stringify(newPlayers));
  res.status(204).send();
});

// Route
app.get('/help', (_, res) => {
  res.status(200).json({ status: 'OK' });
});

// Server
const port = process.env.PORT || 4000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Listining from PORT: ${port}`);
  console.log(`Localhost: ${port}`);
});
