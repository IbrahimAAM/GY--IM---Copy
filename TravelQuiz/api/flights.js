// api/flights.js
import fetch from 'node-fetch';

let accessToken = null;
let tokenExpiry = 0;

async function fetchAccessToken() {
  const now = Date.now();
  if (accessToken && tokenExpiry > now) return accessToken;

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
  accessToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return accessToken;
}

export default async function handler(req, res) {
  try {
    const token = await fetchAccessToken();
    const { origin, destination, departureDate, returnDate } = req.query;

    const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
}
