const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

// parse application/json
app.use(bodyParser.json());

// Configure the database connection
const pool = new Pool({
  host: 'containers-us-west-1.railway.app',
  port: '7599',
  user: 'postgres',
  password: 'zG9XfxH2Wxwz6WTukMHl',
  database: 'railway'
});

// Get consent by key
app.get('/consent/:key', (req, res) => {
  const query = {
    text: 'SELECT * FROM consents WHERE key = $1',
    values: [req.params.key]
  };

  pool.query(query)
    .then((result) => {
      if (result.rows.length === 0) {
        res.status(404).send('Consent not found');
      } else {
        res.send({ consent: result.rows[0].text });
      }
    })
    .catch((err) => {
      console.error('Error retrieving consent:', err);
      res.status(500).send('Internal Server Error');
    });
});

// Create a new consent
app.post('/consent', (req, res) => {
  const consent = {
    key: req.body.key,
    text: req.body.text
  };

  const query = {
    text: 'INSERT INTO consents (key, text) VALUES ($1, $2) RETURNING *',
    values: [consent.key, consent.text]
  };

  pool.query(query)
    .then((result) => {
      const newConsent = result.rows[0];
      res.status(201).send(newConsent);
    })
    .catch((err) => {
      console.error('Error creating consent:', err);
      res.status(500).send('Internal Server Error');
    });
});

// Update a consent
app.put('/consent/:key', (req, res) => {
  const consent = {
    key: req.params.key,
    text: req.body.text
  };

  const query = {
    text: 'UPDATE consents SET text = $1 WHERE key = $2 RETURNING *',
    values: [consent.text, consent.key]
  };

  pool.query(query)
    .then((result) => {
      if (result.rows.length === 0) {
        res.status(404).send('Consent not found');
      } else {
        const updatedConsent = result.rows[0];
        res.send(updatedConsent);
      }
    })
    .catch((err) => {
      console.error('Error updating consent:', err);
      res.status(500).send('Internal Server Error');
    });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.listen(port, () => {
  console.log('Server running');
});
