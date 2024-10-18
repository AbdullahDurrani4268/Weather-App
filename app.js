const loadingSpinner = document.getElementById('loading');
let barChart, doughnutChart, lineChart; // Global variables to store chart instances

// Detect if using the mobile or desktop button
document.querySelectorAll('#getWeather, #getWeatherMobile').forEach(button => {
  button.addEventListener('click', function() {
    const city = document.getElementById('city').value || document.getElementById('cityMobile').value;
    fetchWeatherData(city);
  });
});

// Handle Enter key for search inputs
document.querySelectorAll('#city, #cityMobile').forEach(input => {
  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const city = document.getElementById('city').value || document.getElementById('cityMobile').value;
      fetchWeatherData(city);
    }
  });
});

// Fetch weather data and display it
function fetchWeatherData(city) {
  loadingSpinner.classList.remove('hidden');

  const apiKey = '154712401d40686998706b13a33e2be1'; // Replace with your OpenWeather API key
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      loadingSpinner.classList.add('hidden');

      // Update City Name, Temperature, Humidity, etc.
      document.getElementById('cityDisplay').innerText = data.name;
      document.getElementById('temperature').innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById('humidity').innerText = `${data.main.humidity}%`;
      document.getElementById('windSpeed').innerText = `${data.wind.speed} m/s`;
      document.getElementById('weatherDescription').innerText = data.weather[0].description;

      // Update weather icon
      const iconCode = data.weather[0].icon;
      document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

      // Handle background change based on weather condition
      const weatherCondition = data.weather[0].main.toLowerCase();
      const currentTime = Date.now() / 1000; // Get current time in seconds
      const isDay = currentTime > data.sys.sunrise && currentTime < data.sys.sunset;
      changeBackground(weatherCondition, isDay);

      // Fetch 5-day forecast data
      fetch5DayForecast(data.coord.lat, data.coord.lon); // Pass latitude and longitude
    })
    .catch(error => {
      loadingSpinner.classList.add('hidden');
      alert("City not found. Please enter a valid city name.");
      //page reload
      location.reload();
      console.error('Error fetching weather data:', error);
    });
}

// Fetch 5-Day Weather Forecast
function fetch5DayForecast(latitude, longitude) {
  const apiKey = '154712401d40686998706b13a33e2be1'; // Replace with your OpenWeather API key
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const forecastData = processForecastData(data);
      createBarChart(forecastData);
      createDoughnutChart(forecastData);
      createLineChart(forecastData);
    })
    .catch(error => {
      console.error('Error fetching 5-day forecast:', error);
    });
}

// Process the forecast data
function processForecastData(data) {
  const days = {};
  const weatherCounts = {};
  
  data.list.forEach((forecast) => {
    const date = forecast.dt_txt.split(' ')[0]; // Get only the date (YYYY-MM-DD)
    
    if (!days[date]) {
      days[date] = {
        temperatures: [],
        weatherConditions: []
      };
    }
    
    // Collect temperatures and weather conditions for each day
    days[date].temperatures.push(forecast.main.temp);
    days[date].weatherConditions.push(forecast.weather[0].main);
    
    // Count occurrences of each weather condition
    const weatherCondition = forecast.weather[0].main;
    if (weatherCounts[weatherCondition]) {
      weatherCounts[weatherCondition]++;
    } else {
      weatherCounts[weatherCondition] = 1;
    }
  });
  
  // Calculate daily average temperature and collect top weather condition
  const processedData = {
    dailyTemperatures: [],
    dailyWeather: [],
    weatherConditionCounts: weatherCounts
  };
  
  Object.keys(days).forEach((date) => {
    const avgTemp = days[date].temperatures.reduce((a, b) => a + b, 0) / days[date].temperatures.length;
    processedData.dailyTemperatures.push({ date, avgTemp });
  });
  
  return processedData;
}

// Load weather information based on geolocation
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        fetchWeatherByLocation(latitude, longitude);
        fetch5DayForecast(latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enter a city manually.');
      }
    );
  } else {
    alert('Geolocation is not supported by this browser. Please enter a city manually.');
  }
});

// Fetch weather based on geolocation
function fetchWeatherByLocation(latitude, longitude) {
  const apiKey = '154712401d40686998706b13a33e2be1'; // Replace with your OpenWeather API key
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  // Show the spinner while fetching
  loadingSpinner.classList.remove('hidden');

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      loadingSpinner.classList.add('hidden');

      // Update City Name, Temperature, Humidity, etc.
      document.getElementById('cityDisplay').innerText = data.name;
      document.getElementById('temperature').innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById('humidity').innerText = `${data.main.humidity}%`;
      document.getElementById('windSpeed').innerText = `${data.wind.speed} m/s`;
      document.getElementById('weatherDescription').innerText = data.weather[0].description;

      // Update weather icon
      const iconCode = data.weather[0].icon;
      document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

      // Handle background change
      const weatherCondition = data.weather[0].main.toLowerCase();
      const currentTime = Date.now() / 1000;
      const isDay = currentTime > data.sys.sunrise && currentTime < data.sys.sunset;
      changeBackground(weatherCondition, isDay);

      // Handle temperature unit toggle
      handleTemperatureToggle(data.main.temp);
    })
    .catch(error => {
      loadingSpinner.classList.add('hidden');
      console.error('Error fetching weather data:', error);
      alert('Error fetching weather data. Please try again.');
    });
}

// Function to change the background based on weather condition and day/night
function changeBackground(weatherCondition, isDay) {
  const weatherWidget = document.getElementById('main');

  // Reset background first
  weatherWidget.classList.remove('clear-day', 'clear-night', 'cloudy-day', 'cloudy-night', 'rainy', 'snowy', 'stormy', 'misty');

  if (weatherCondition.includes('clear')) {
    weatherWidget.classList.add(isDay ? 'clear-day' : 'clear-night'); // Clear sky for day or night
    if (!isDay) {
      //weatherWidget.style.color = 'white'; // Change text color to white for night
    }
  } else if (weatherCondition.includes('clouds')) {
    weatherWidget.classList.add(isDay ? 'cloudy-day' : 'cloudy-night'); // Cloudy for day or night
    if (!isDay) {
      //weatherWidget.style.color = 'white'; // Change text color to white for night
    }
  } else if (weatherCondition.includes('rain')) {
    weatherWidget.classList.add(isDay ? 'rainy-day' : 'rainy-night'); // Rainy for day or night
    if (!isDay) {
      //weatherWidget.style.color = 'white'; // Change text color to white for night
    }
  } else if (weatherCondition.includes('snow')) {
    weatherWidget.classList.add('snowy'); // Snow
  } else if (weatherCondition.includes('storm')) {
    weatherWidget.classList.add('stormy'); // Storm
  } else if (weatherCondition.includes('mist') || weatherCondition.includes('fog') || weatherCondition.includes('haze') || weatherCondition.includes('smoke')) {
    weatherWidget.classList.add(isDay ? 'misty-day' : 'misty-night'); // Mist or fog for day or night
    if (!isDay) {
      //weatherWidget.style.color = 'white'; // Change text color to white for night
    }
  }
}

// Handle temperature unit toggle
function handleTemperatureToggle(temperatureCelsius) {
  const celsiusBtn = document.getElementById('celsiusBtn');
  const fahrenheitBtn = document.getElementById('fahrenheitBtn');
  let currentTemp = temperatureCelsius;

  celsiusBtn.addEventListener('click', () => {
    document.getElementById('temperature').innerText = `${Math.round(currentTemp)}°C`;
    celsiusBtn.classList.add('bg-[#62a1c7]', 'text-white');
    fahrenheitBtn.classList.remove('bg-[#62a1c7]', 'text-white');
    fahrenheitBtn.classList.add('bg-gray-300', 'text-black');
  });

  fahrenheitBtn.addEventListener('click', () => {
    const tempFahrenheit = (currentTemp * 9/5) + 32;
    document.getElementById('temperature').innerText = `${Math.round(tempFahrenheit)}°F`;
    fahrenheitBtn.classList.add('bg-[#62a1c7]', 'text-white');
    celsiusBtn.classList.remove('bg-[#62a1c7]', 'text-white');
    celsiusBtn.classList.add('bg-gray-300', 'text-black');
  });
}

// Create Bar Chart
function createBarChart(forecastData) {
  const ctx = document.getElementById('barChart').getContext('2d');

  // Destroy previous chart if it exists
  if (barChart) {
    barChart.destroy();
  }

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: forecastData.dailyTemperatures.map(day => day.date),
      datasets: [{
        label: 'Average Temperature (°C)',
        data: forecastData.dailyTemperatures.map(day => day.avgTemp),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      animation: {
        duration: 2000, // Delay animation
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black' // Set y-axis text color to black
          }
        },
        x: {
          ticks: {
            color: 'black' // Set x-axis text color to black
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black' // Set legend text color to black
          }
        }
      }
    }
  });
}

// Create Doughnut Chart
function createDoughnutChart(forecastData) {
  const ctx = document.getElementById('doughnutChart').getContext('2d');

  // Destroy previous chart if it exists
  if (doughnutChart) {
    doughnutChart.destroy();
  }

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(forecastData.weatherConditionCounts),
      datasets: [{
        data: Object.values(forecastData.weatherConditionCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      animation: {
        duration: 2000, // Delay animation
      },
      plugins: {
        legend: {
          labels: {
            color: 'black' // Set legend text color to black
          }
        }
      }
    }
  });
}

// Create Line Chart
function createLineChart(forecastData) {
  const ctx = document.getElementById('lineChart').getContext('2d');

  // Destroy previous chart if it exists
  if (lineChart) {
    lineChart.destroy();
  }

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecastData.dailyTemperatures.map(day => day.date),
      datasets: [{
        label: 'Temperature (°C)',
        data: forecastData.dailyTemperatures.map(day => day.avgTemp),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false
      }]
    },
    options: {
      animation: {
        easing: 'easeOutBounce', // Drop animation for line chart
        duration: 2000
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black' // Set y-axis text color to black
          }
        },
        x: {
          ticks: {
            color: 'black' // Set x-axis text color to black
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black' // Set legend text color to black
          }
        }
      }
    }
  });
}
