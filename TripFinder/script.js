const cityToIATACode = {
  'sydney': 'SYD', 'bangkok': 'BKK', 'new york': 'JFK', 'los angeles': 'LAX',
  'tokyo': 'NRT', 'paris': 'CDG', 'london': 'LHR', 'dubai': 'DXB',
  'singapore': 'SIN', 'alaska': 'ANC', 'cairo': 'CAI', 'mumbai': 'BOM',
  'beijing': 'PEK', 'rome': 'FCO', 'barcelona': 'BCN', 'istanbul': 'IST',
  'seoul': 'ICN', 'moscow': 'SVO', 'amsterdam': 'AMS', 'hong kong': 'HKG',
  'san francisco': 'SFO', 'las vegas': 'LAS', 'miami': 'MIA', 'toronto': 'YYZ',
  'vancouver': 'YVR', 'mexico city': 'MEX', 'buenos aires': 'EZE',
  'sao paulo': 'GRU', 'lima': 'LIM', 'santiago': 'SCL', 'bogota': 'BOG', 'caracas': 'CCS'
};

document.getElementById('quizForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const origin = document.getElementById('origin').value.toLowerCase().trim();
  const destination = document.getElementById('destination').value.toLowerCase().trim();
  const departureDate = document.getElementById('departureDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;

  const originCode = cityToIATACode[origin];
  const destinationCode = cityToIATACode[destination];

  if (!originCode) return alert(' Unknown origin city.');
  if (!destinationCode) return alert(' Unknown destination city.');
  if (!departureDate || !returnDate) return alert(' Please select both departure and return dates.');
  if (new Date(returnDate) < new Date(departureDate)) {
    return alert(' Return date must be after departure date.');
  }

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '🔄 Searching...';

  try {
    const res = await fetch(`/api/flights?origin=${originCode}&destination=${destinationCode}&departureDate=${departureDate}&returnDate=${returnDate}`);

    if (!res.ok) {
      const text = await res.text();
      console.error('Server error:', text);
      resultsContainer.textContent = 'Server error. Please try again later.';
      return;
    }

    const data = await res.json();
    resultsContainer.innerHTML = '';

    if (Array.isArray(data.data) && data.data.length > 0) {
      let found = false;
      data.data.forEach(flight => {
        const price = parseFloat(flight.price.total);
        if (price <= maxPrice) {
          found = true;
          const segment = flight.itineraries[0]?.segments[0];
          const offer = document.createElement('div');
          offer.className = 'bg-white border border-gray-300 p-4 rounded shadow mb-4';
          offer.innerHTML = `
            <p><strong>✈ Airline:</strong> ${segment?.carrierCode || 'N/A'}</p>
            <p><strong>From:</strong> ${segment?.departure.iataCode}</p>
            <p><strong>To:</strong> ${segment?.arrival.iataCode}</p>
            <p><strong>Departure:</strong> ${segment?.departure.at}</p>
            <p><strong>Arrival:</strong> ${segment?.arrival.at}</p>
            <p><strong>Price:</strong> ${flight.price.total} ${flight.price.currency}</p>
          `;
          resultsContainer.appendChild(offer);
        }
      });
      if (!found) resultsContainer.textContent = 'No flights found within the price range.';
    } else {
      resultsContainer.textContent = 'No flights found.';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    resultsContainer.textContent = ' Network or server error occurred.';
  }
});
