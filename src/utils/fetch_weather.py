import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv('OPENWEATHERAPI_KEY')
base_url = "http://api.weatherapi.com/v1/history.json"

def fetch_weather(city, start, end):
    params = {
        "key": api_key,
        "q": city,
        "dt": start,
        "aqi": "no",
        "alerts": "no"
    }
    response = requests.get(base_url, params=params)
    print(response)
    data = response.json()
    return parse_weather_data(data)

def parse_weather_data(data):
    hourly_data = []
    for forecast_day in data['forecast']['forecastday']:
        for hour_data in forecast_day["hour"]:
            timestamp = datetime.strptime(hour_data["time"], "%Y-%m-%d %H:%M")
            temp = hour_data["temp_c"]
            hourly_data.append({"timestamp": timestamp, "temp": temp})
    return pd.DataFrame(hourly_data)