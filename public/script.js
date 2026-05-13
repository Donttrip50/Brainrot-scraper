async function checkPrices() {
  const brainrot =
    document.getElementById('brainrot').value;

  const mutation =
    document.getElementById('mutation').value;

  const currency =
    document.getElementById('currency').value;

  const results = document.getElementById('results');

  results.innerHTML = '<div class="result-card">Loading...</div>';

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        brainrot,
        mutation,
        currency
      })
    });

    const data = await response.json();

    if (!data.success) {
      results.innerHTML = `
        <div class="result-card">
          ${data.message || 'No results'}
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div class="result-card">
        <h2>Market Stats</h2>
        <br>
        <p><strong>Listings:</strong> ${data.stats.listingCount}</p>
        <p><strong>Average USD:</strong> $${data.stats.averageUSD}</p>
        <p><strong>Converted Average:</strong> ${data.search.currency} ${data.stats.convertedAverage}</p>
        <p><strong>Lowest:</strong> $${data.stats.lowest}</p>
        <p><strong>Highest:</strong> $${data.stats.highest}</p>
      </div>

      <div class="result-card">
        <h2>Listings</h2>
        <br>
        ${data.listings.map(item => `
          <div class="listing">
            <div>${item.title}</div>
            <strong>$${item.price}</strong>
          </div>
        `).join('')}
      </div>
    `;

  } catch (err) {
    results.innerHTML = `
      <div class="result-card">
        Error fetching listings.
      </div>
    `;
  }
}