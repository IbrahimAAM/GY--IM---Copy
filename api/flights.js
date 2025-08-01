const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Amadeus credentials.");
      return res.status(500).json({ error: "Missing Amadeus credentials" });
    }

    // Get access token
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token fetch failed:", tokenData);
      return res.status(500).json({
        error: 'Token fetch failed',
        details: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // Validate query parameters
    const { origin, destination, departureDate, returnDate } = req.query;
    if (!origin || !destination || !departureDate || !returnDate) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Fetch flight offers
    const flightRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const flightData = await flightRes.json();

    if (!flightRes.ok) {
      console.error("Flight API error:", flightData);
      return res.status(500).json({
        error: 'Flight search failed',
        details: flightData
      });
    }

    return res.status(200).json(flightData);

  } catch (err) {
    console.error("Server crashed:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
