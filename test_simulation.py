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
    data = response.json()
    return data

def parse_weather_data(data):
    hourly_data = []
    for forecast_day in data['forecast']['forecastday']:
        for hour_data in forecast_day["hour"]:
            timestamp = datetime.strptime(hour_data["time"], "%Y-%m-%d %H:%M")
            temp = hour_data["temp_c"]
            hourly_data.append({"timestamp": timestamp, "temp": temp})
    return pd.DataFrame(hourly_data)

# Constants
SOLAR_GAIN = 6300  # W
HEATING_POWER = 11200  # W
THERMAL_MASS = 193370  # J/K
U_DAY = 1.82  # W/m^2-K
U_NIGHT = 1.96  # W/m^2-K
AREA = 100  # m^2 (assuming area for heat loss calculation)

def daytime_temp(T_external, solar_gain, thermal_mass, U_value, area, T_internal_prev):
    heat_loss = U_value * area * (T_external - T_internal_prev)
    T_internal = T_external + (solar_gain - heat_loss) / thermal_mass
    return T_internal

def nighttime_temp(T_internal_prev, Q_thermal, Q_loss, thermal_mass):
    T_internal = T_internal_prev + (Q_thermal - Q_loss) / thermal_mass
    return T_internal

def calculate_hourly_temperatures(weather_data, initial_temp):
    temperatures = []
    T_internal = initial_temp

    for _, row in weather_data.iterrows():
        timestamp = row["timestamp"]
        T_external = row["temp"]
        hour = timestamp.hour
        is_daytime = 6 <= hour < 18  # Assuming daytime is from 6 AM to 6 PM

        solar_gain = SOLAR_GAIN * np.sin(np.pi * (hour - 6) / 12) if is_daytime else 0

        if is_daytime:
            T_internal = daytime_temp(T_external, solar_gain, THERMAL_MASS, U_DAY, AREA, T_internal)
        else:
            Q_thermal = HEATING_POWER
            Q_loss = U_NIGHT * AREA * (T_internal - T_external)
            T_internal = nighttime_temp(T_internal, Q_thermal, Q_loss, THERMAL_MASS)

        temperatures.append((timestamp, T_internal, T_external))

    return pd.DataFrame(temperatures, columns=['Timestamp', 'Internal Temperature (°C)', 'External Temperature (°C)'])

def celsius_to_fahrenheit(df):
    df['Internal Temperature (°F)'] = df['Internal Temperature (°C)'] * 9/5 + 32
    df['External Temperature (°F)'] = df['External Temperature (°C)'] * 9/5 + 32
    return df

def main():
    city = str(input("Enter city name: "))
    start_date = "2024-03-01"
    end_date = "2024-03-02" 
    initial_temp = 20

    weather_data = fetch_weather(city, start_date, end_date)
    weather_df = parse_weather_data(weather_data)

    print("Running Sim...")
    hourly_temps = calculate_hourly_temperatures(weather_df, initial_temp)
    hourly_temps = celsius_to_fahrenheit(hourly_temps)
    print(hourly_temps)

if __name__ == "__main__":
    main()