 const cityToIATACode = {
  'sydney': 'SYD',
  'bangkok': 'BKK',
  'new york': 'JFK',
  'los angeles': 'LAX',
    'tokyo': 'NRT',
    'paris': 'CDG',
    'london': 'LHR',
    'dubai': 'DXB',
    'singapore': 'SIN',
    'alaska': 'ANC',
    'cairo': 'CAI',
    'mumbai': 'BOM',
    'beijing': 'PEK',
    'rome': 'FCO',
    'barcelona': 'BCN',
    'istanbul': 'IST',
    'seoul': 'ICN',
    'moscow': 'SVO',
    'amsterdam': 'AMS',
    'hong kong': 'HKG',
    'san francisco': 'SFO',
    'las vegas': 'LAS',
    'miami': 'MIA',
    'toronto': 'YYZ',
    'vancouver': 'YVR',
    'mexico city': 'MEX',
    'buenos aires': 'EZE',
    'sao paulo': 'GRU',
    'lima': 'LIM',
    'santiago': 'SCL',
    'bogota': 'BOG',
    'caracas': 'CCS',
    }

document.getElementById('quizForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const origin = document.getElementById('origin').value.toLowerCase().trim();
  const destination = document.getElementById('destination').value.toLowerCase().trim();
  const departureDate = document.getElementById('departureDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const interest = document.getElementById('interest').value;

  const originCode = cityToIATACode[origin];
  const destinationCode = cityToIATACode[destination];

  if (!originCode) {
    alert('Unknown origin city.');
    return;
  }
  if (!destinationCode) {
    alert('Unknown destination.');
    return;
  }

  if (new Date(returnDate) < new Date(departureDate)) {
  alert('Return date must be after departure date.');
  return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: originCode,
        destination: destinationCode,
        departureDate,
        returnDate,
        adults: 1
      })
    });

    const data = await res.json();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (Array.isArray(data)) {
      data.forEach(flight => {
        const offer = document.createElement('div');
        offer.className = 'bg-gray-50 border border-gray-200 p-4 rounded mt-2';
        const segment = flight.itineraries[0]?.segments[0];
        offer.innerHTML = `
          <p><strong>Airline:</strong> ${segment?.carrierCode}</p>
          <p><strong>From:</strong> ${segment?.departure.iataCode}</p>
          <p><strong>To:</strong> ${segment?.arrival.iataCode}</p>
          <p><strong>Price:</strong> ${flight.price.total} ${flight.price.currency}</p>
        `;
        resultsContainer.appendChild(offer);
      });
    } else {
      resultsContainer.textContent = 'No flights found.';
    }

  } catch (err) {
    console.error('Error:', err);
    alert('Error fetching flight data.');
  }
});

