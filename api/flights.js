const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // Get Access Token
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Token error:", data);
      return res.status(response.status).json({ error: 'Failed to get access token', details: data });
    }

    const accessToken = data.access_token;

    // Get flight query params
    const { origin, destination, departureDate, returnDate } = req.query;

    // Fetch flight offers
    const flightRes = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const flightData = await flightRes.json();

    if (!flightRes.ok) {
      console.error("❌ Flight fetch error:", flightData);
      return res.status(flightRes.status).json({ error: 'Failed to fetch flight data', details: flightData });
    }

    // Send flight data response
    res.status(200).json(flightData);

  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
