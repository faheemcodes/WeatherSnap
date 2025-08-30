let currentUnit = 'metric';
let currentData = null;

// Handle Enter key press in search input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
}

// Change temperature unit
function changeUnit(unit) {
    currentUnit = unit;

    // Update button states
    document.getElementById('celsiusBtn').classList.toggle('active', unit === 'metric');
    document.getElementById('fahrenheitBtn').classList.toggle('active', unit === 'imperial');

    // If we have data, update display with new unit
    if (currentData) {
        updateWeatherDisplay(currentData);
        getForecast(document.getElementById('cityInput').value.trim());
    }
}

// Get weather data from API
async function getWeather() {
    const apiKey = 'ee85f106df44a1d1dd3b1306090491d4';
    const city = document.getElementById('cityInput').value.trim();
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.querySelector('.loading');
    const resultDiv = document.getElementById('weatherResult');

    // Hide previous errors and results
    errorDiv.style.display = 'none';
    resultDiv.classList.remove('show');

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    // Show loading state
    loadingDiv.style.display = 'block';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message || 'City not found');
        }

        // Store current data and update display
        currentData = data;
        updateWeatherDisplay(data);

        // Also get forecast data
        await getForecast(city);

        // Show result with animation
        loadingDiv.style.display = 'none';
        resultDiv.classList.add('show');

    } catch (err) {
        loadingDiv.style.display = 'none';
        showError('City not found. Please check the spelling and try again.');
    }
}

// Get 6-day forecast
async function getForecast(city) {
    const apiKey = 'ee85f106df44a1d1dd3b1306090491d4';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`);
        const data = await response.json();

        if (data.cod !== '200') {
            console.error('Forecast error:', data.message);
            return;
        }

        updateForecastDisplay(data);
    } catch (err) {
        console.error('Failed to fetch forecast:', err);
    }
}

// Update weather display with data
function updateWeatherDisplay(data) {
    // Update main weather info
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    // Update weather icon
    const weatherIcon = document.getElementById('weatherIcon');
    const iconCode = data.weather[0].icon;

    // Map OpenWeatherMap icons to FontAwesome
    const iconMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };

    weatherIcon.className = `fas ${iconMap[iconCode] || 'fa-cloud'} weather-icon`;
}

// Update forecast display for 6 days
function updateForecastDisplay(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    // Get unique days from the forecast data
    const forecasts = [];
    const uniqueDays = new Set();

    // Process each forecast item
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        // If we haven't seen this day yet and we need more days
        if (!uniqueDays.has(day) && forecasts.length < 6) {
            uniqueDays.add(day);
            forecasts.push({
                day,
                temp: item.main.temp,
                icon: item.weather[0].icon
            });
        }
    });

    // Map OpenWeatherMap icons to FontAwesome
    const iconMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };

    // Create forecast items
    forecasts.forEach(forecast => {

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
        <div class="forecast-day">${forecast.day}</div>
        <div class="forecast-temp">${Math.round(forecast.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</div>
      `;

        forecastContainer.appendChild(forecastItem);
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Get weather for default city on load
window.onload = function () {
    document.getElementById('cityInput').value = 'Karachi';
    getWeather();
};