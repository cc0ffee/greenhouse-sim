### NOTES ###
# We need to be able to change the material, thus thermal mass calculation needs to be added
# We have some pre-defined heating systems which contributes to heating power
# This heating power contributes to the "no heat vs heat" calculations
# U-Values will be the R-values of materials

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import matplotlib.pyplot as plt
from src.consts import *
from src.formulas import *
from src.utils.fetch_weather import fetch_weather

# Constants
HEATING_POWER = 11200  # W
THERMAL_MASS = 193370  # J/K
U_DAY = 1.96 # W/m^2-K
U_NIGHT = 0.86  # W/m^2-K
AREA = GREENHOUSE_AREA  # m^2 (assuming area for heat loss calculation)

def calculate_hourly_temperatures(weather_data):
    temperatures = []
    T_internal = None
    for _, row in weather_data.iterrows():
        timestamp = row["timestamp"]

        T_external = row["temp"]
        
        if T_internal is None:
            T_internal = T_external

        hour = timestamp.hour
        is_daytime = row["is_daytime"]

        # add the angle of sun to greenhouse
        solar_gain = solar_gain_func(SOLAR_GAIN, hour) if is_daytime else 0

        if is_daytime:
            T_internal = daytime_temp(T_external, solar_gain, THERMAL_MASS, U_DAY, AREA, T_internal)
        else:
            T_internal = nighttime_temp(T_external, HEATING_POWER, THERMAL_MASS, U_NIGHT, AREA, T_internal)

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

    weather_df = fetch_weather(city, start_date, end_date)
    # weather_df = parse_weather_data(weather_data)

    print("Running Sim...")
    hourly_temps = calculate_hourly_temperatures(weather_df)
    hourly_temps = celsius_to_fahrenheit(hourly_temps)

    # Filter the data to include only the timestamps from hour 6 onwards
    # hourly_temps_filtered = hourly_temps[hourly_temps['Timestamp'].dt.hour >= 6]

    # Plot the results with data points
    plt.figure(figsize=(10, 5))
    plt.plot(hourly_temps["Timestamp"], hourly_temps["Internal Temperature (°F)"], label="Internal Temp (°F)",
             color="r", marker="o")
    plt.plot(hourly_temps["Timestamp"], hourly_temps["External Temperature (°F)"], label="External Temp (°F)",
             color="b", marker="x")

    plt.xlabel("Time")
    plt.ylabel("Temperature (°F)")
    plt.title("Internal and External Temperature Over Time (°F)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.grid()

    # Show the temperature values at each tick
    for x, y in zip(hourly_temps["Timestamp"], hourly_temps["Internal Temperature (°F)"]):
        plt.text(x, y, f"{y:.1f}", ha="right", va="bottom", fontsize=8, color="black")
    for x, y in zip(hourly_temps["Timestamp"], hourly_temps["External Temperature (°F)"]):
        plt.text(x, y, f"{y:.1f}", ha="left", va="top", fontsize=8, color="blue")

    plt.show()

if __name__ == "__main__":
    main()