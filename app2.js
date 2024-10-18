// Replace with your actual API key
const API_KEY = 'AIzaSyCVNDwopk5l59ziQl_PTFXD19c7rErN7tw';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let forecastData = [];
let filteredData = [];
let currentPage = 1;
const entriesPerPage = 10;

const loadingSpinner = document.getElementById('loading');

// Geolocation Support: Fetch weather for current location on page load
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
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

// Fetch the 5-day forecast data
function fetch5DayForecast(lat, lon) {
  const apiKey = '154712401d40686998706b13a33e2be1'; // Replace with your OpenWeather API key
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  loadingSpinner.classList.remove('hidden'); // Show the loading spinner

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      forecastData = data.list; // Store the forecast data
      filteredData = [...forecastData]; // Initialize filteredData with the full forecast
      displayPage(1); // Display the first page
      loadingSpinner.classList.add('hidden'); // Hide the loading spinner
    })
    .catch(error => {
      loadingSpinner.classList.add('hidden');
      console.error('Error fetching forecast data:', error);
    });
}

// Apply the selected filter to the forecast data
function applyFilter(filter) {
  filteredData = [...forecastData]; // Reset filteredData to the full forecastData

  switch (filter) {
    case 'asc':
      filteredData.sort((a, b) => a.main.temp - b.main.temp);
      break;
    case 'desc':
      filteredData.sort((a, b) => b.main.temp - a.main.temp);
      break;
    case 'rain':
      filteredData = filteredData.filter(entry => entry.weather[0].main.toLowerCase().includes('rain'));
      break;
    case 'max':
      const maxTempEntry = filteredData.reduce((max, current) => current.main.temp > max.main.temp ? current : max);
      filteredData = [maxTempEntry];
      break;
    default:
      filteredData.sort((a, b) => new Date(a.dt_txt) - new Date(b.dt_txt));
      break;
  }

  displayPage(1);
}

// Event listener for the filter dropdown
document.getElementById('tableFilter').addEventListener('change', function() {
  const selectedFilter = this.value;
  applyFilter(selectedFilter);
});

// Display the forecast data for the current page
function displayPage(page) {
  const forecastTable = document.getElementById('forecastTable');
  forecastTable.innerHTML = ''; // Clear the table before displaying new entries

  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const forecast = filteredData[i];
    const date = forecast.dt_txt.split(' ')[0];
    const time = forecast.dt_txt.split(' ')[1];
    const temp = `${Math.round(forecast.main.temp)}°C`;
    const weatherCondition = forecast.weather[0].description;

    forecastTable.innerHTML += `
      <tr>
        <td class="border px-4 py-2">${date}</td>
        <td class="border px-4 py-2">${time}</td>
        <td class="border px-4 py-2">${temp}</td>
        <td class="border px-4 py-2">${weatherCondition}</td>
      </tr>
    `;
  }

  document.getElementById('prevPage').disabled = page === 1;
  document.getElementById('nextPage').disabled = endIndex >= filteredData.length;
}

// Pagination controls
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage);
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayPage(currentPage);
  }
});

// Search city and fetch forecast
document.querySelectorAll('#getWeather, #getWeatherMobile').forEach(button => {
  button.addEventListener('click', function() {
    const city = document.getElementById('city').value || document.getElementById('cityMobile').value;
    fetchWeatherDataByCity(city);
  });
});

// Handle Enter key for search inputs
document.querySelectorAll('#city, #cityMobile').forEach(input => {
  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const city = document.getElementById('city').value || document.getElementById('cityMobile').value;
      fetchWeatherDataByCity(city);
    }
  });
});

function fetchWeatherDataByCity(city) {
  const apiKey = '154712401d40686998706b13a33e2be1'; // Replace with your OpenWeather API key
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  loadingSpinner.classList.remove('hidden'); // Show the loading spinner

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      fetch5DayForecast(lat, lon);
      loadingSpinner.classList.add('hidden');
    })
    .catch(error => {
      loadingSpinner.classList.add('hidden');
      alert('City not found. Please enter a valid city.');
      console.error('Error fetching weather data:', error);
    });
}

function addMessage(content, isUser = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
  messageElement.textContent = content;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
}

// Keywords to identify weather-related questions
const weatherKeywords = ['weather', 'forecast', 'temperature', 'rain', 'wind', 'humidity', 'clouds', 'min', 'minimum', 'max', 'maximum'];

// Simplified Gemini API call for chatbot
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, true); // Add user's message
  userInput.value = ''; // Clear input field

  // Analyze the message for weather-related keywords
  const isWeatherRelated = weatherKeywords.some(keyword => message.toLowerCase().includes(keyword));

  let botPrompt;
  if (isWeatherRelated) {
    // If weather-related, provide weather information in the prompt
    botPrompt = `You are a weather assistant chatbot. Use this weather information: ${JSON.stringify(forecastData)}
                    Answer the following user question: ${message}`;
    console.log(botPrompt);
              
  } else {
    // If not weather-related, just forward the message
    botPrompt = message;
  }

  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  const payload = {
    contents: [{
      parts: [{
        text: botPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  // Calling the Gemini API through ajax
  $.ajax({
    url: `${API_URL}?key=${API_KEY}`,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    dataType: 'json',
    success: function(data) {
      const botResponse = data.candidates[0].content.parts[0].text;
      addMessage(botResponse); // Add bot's response to the chat
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Error:', errorThrown);
      addMessage('Sorry, I encountered an error. Please try again.');
    }
  });
}
  
// Event listeners for sending the message
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
