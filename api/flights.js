// api/flights.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // Get Access Token
    const authRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      })
    });

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // Get flight data
    const { origin, destination, departureDate, returnDate } = req.query;
    const flightRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const flightData = await flightRes.json();
    res.status(200).json(flightData);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
