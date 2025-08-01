// api/flights.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // Step 1: Get access token
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

    if (!authRes.ok) {
      console.error("❌ Token error:", authData);
      return res.status(401).json({
        error: 'Failed to get access token',
        details: authData
      });
    }

    const accessToken = authData.access_token;

    // Step 2: Use token to fetch flights
    const { origin, destination, departureDate, returnDate } = req.query;

    const flightRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const flightData = await flightRes.json();

    if (!flightRes.ok) {
      console.error("❌ Flight error:", flightData);
      return res.status(500).json({ error: 'Failed to fetch flights', details: flightData });
    }

    res.status(200).json(flightData);
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
