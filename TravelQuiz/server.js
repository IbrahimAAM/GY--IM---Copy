require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

// Initialize Amadeus only if credentials are present
let amadeus = null;
if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
  amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
  });
}

app.post('/api/flights', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults } = req.body;

  if (amadeus) {
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults
      });
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch flights', details: error.description || error.message });
    }
  } else {
    // Dummy response for testing if Amadeus credentials are missing
    res.json([
      {
        price: { total: "500", currency: "USD" },
        itineraries: [
          {
            segments: [
              {
                carrierCode: "AA",
                departure: { iataCode: "JFK" },
                arrival: { iataCode: "LAX" }
              }
            ]
          }
        ]
      }
    ]);
  }
});

// Optional: Serve index.html at root if you want http://localhost:3000/ to work
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
}); 