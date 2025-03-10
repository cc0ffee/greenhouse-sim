### NOTES ###
# We need to be able to change the material, thus thermal mass calculation needs to be added
# We have some pre-defined heating systems which contributes to heating power
# This heating power contributes to the "no heat vs heat" calculations
# U-Values will be the R-values of materials

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import requests
import json
from dotenv import load_dotenv
import os
import matplotlib.pyplot as plt
from consts import *
from utils.fetch_weather import fetch_weather

load_dotenv()

api_key = os.getenv('OPENWEATHERAPI_KEY')
base_url = "http://api.weatherapi.com/v1/history.json"

# Constants
SOLAR_GAIN = DEFAULT_GHI * GREENHOUSE_AREA * TRANSMISSION_EFFICIENCY  # W
HEATING_POWER = 11200  # W
THERMAL_MASS = 193370  # J/K
U_DAY = 1.82  # W/m^2-K
U_NIGHT = 1.96  # W/m^2-K
AREA = GREENHOUSE_AREA  # m^2 (assuming area for heat loss calculation)

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
    start_date = "2024-05-01"
    end_date = "2024-05-02" 
    initial_temp = 20

    weather_df = fetch_weather(city, start_date, end_date)
    # weather_df = parse_weather_data(weather_data)

    print("Running Sim...")
    hourly_temps = calculate_hourly_temperatures(weather_df, initial_temp)
    hourly_temps = celsius_to_fahrenheit(hourly_temps)
    # print(hourly_temps)
    # Convert temperatures to Fahrenheit
    hourly_temps["Internal Temperature (°F)"] = hourly_temps["Internal Temperature (°C)"] * 9 / 5 + 32

    # Plot the results with data points
    plt.figure(figsize=(10, 5))
    plt.plot(hourly_temps["Timestamp"], hourly_temps["Internal Temperature (°F)"], label="Internal Temp (°F)",
             color="r", marker="o")

    plt.xlabel("Time")
    plt.ylabel("Temperature (°F)")
    plt.title("Internal Temperature Over Time (°F)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.grid()

    # Show the temperature values at each tick
    for x, y in zip(hourly_temps["Timestamp"], hourly_temps["Internal Temperature (°F)"]):
        plt.text(x, y, f"{y:.1f}", ha="right", va="bottom", fontsize=8, color="black")

    plt.show()

if __name__ == "__main__":
    main()