# Weather Dashboard Application

Faslon ko takaluf hai hamse agar. Ham bhi baybus nahi bay sahara nahi. Khud unhi ko pukarienge ham door se
raaste mein agar paaon thak jayeinge.

qwertyui
gfhgfhgfhg,mnmjgnhfnf

## Project Overview
This Weather Dashboard application is a web-based tool that provides users with current weather conditions, a 5-day weather forecast, and interactive weather charts. 
It includes two main pages: a **Dashboard** for general weather information and charts, and a **Table** page for viewing the forecast data in a tabular format. 
Additionally, the application features a chatbot capable of handling weather-related questions.

The app uses the **OpenWeather API** to fetch weather data, **Chart.js** for visualizing weather conditions and **Gemini API** to integrate with the chatbot.

## Features

### Current Weather Display:
- Users can search for weather by entering a city or using their geolocation.
- Displays current temperature, weather description, humidity, wind speed, and weather icons.
- Option to toggle between Celsius and Fahrenheit.

### 5-Day Weather Forecast:
- Provides a 5-day forecast in both graphical (Dashboard) and tabular (Tables) format.
- The table contains filters (ascending, descending, rainy days and highest temperature) to provide more clearer view.
- Charts available: Bar chart, Doughnut chart, and Line chart for temperature trends and weather conditions.

### Geolocation Support:
- Fetches the current location's weather and forecast using the device's geolocation.

### Chatbot:
- A chatbot integrated with the **Gemini API** that can answer weather-related questions based on the forecast data.

## Project Structure

- `weather.html`: Main entry point, displaying the weather dashboard.
- `table.html`: Displays weather forecast data in a table format.
- `app.js`: Contains all JavaScript functionality for the dashboard page, including API calls and chart creation.
- `app2.js`: Contains the logic for the table page, chatbot functionality, and additional forecast filtering and pagination.
- `styles.css` (integrated in the HTML): Contains custom styles for different weather conditions and UI elements.

## Technologies Used

- **HTML5 & CSS3**: For the structure and styling of the web pages.
- **JavaScript**: For dynamic content updates and fetching data from APIs.
- **Tailwind CSS**: For responsive design and utility-based styling.
- **Chart.js**: For creating dynamic charts based on weather data.
- **Font Awesome**: For using icons in the UI.
- **OpenWeather API**: To fetch real-time weather data.
- **Gemini API**: To power the chatbot's responses.

## Setup Instructions

### Prerequisites
- Ensure you have a stable internet connection as the application fetches real-time weather data from the OpenWeather API.
- A modern web browser (Google Chrome, Mozilla Firefox, etc.) to view the web pages.

### Step-by-Step Guide

#### 1. Clone the Repository:
Clone the project files or copy them into a local directory on your system.

#### 2. Run the Application:
- Open the `dashboard.html` file in a browser to test the functionality.
- Enter a city name or allow geolocation access for weather data.

### Notes
- The application will display a loading spinner while fetching weather data.
- If the chatbot or weather data doesn’t work, check your internet connection.

## Additional Features

### Filter Options (Table Page):
- Users can filter the forecast data by temperature (ascending/descending), rain conditions, or highest temperature.

### Pagination (Table Page):
- Weather data is paginated, showing 10 entries per page with navigation controls.
