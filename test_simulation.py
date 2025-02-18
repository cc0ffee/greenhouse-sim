import numpy as np
import pandas as pd
from datetime import datetime, timedelta

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

def calculate_hourly_temperatures(start_date, end_date, initial_temp, external_temp_func, solar_gain_func):
    date_range = pd.date_range(start=start_date, end=end_date, freq='h')
    temperatures = []
    T_internal = initial_temp

    for timestamp in date_range:
        hour = timestamp.hour
        is_daytime = 6 <= hour < 18  # Assuming daytime is from 6 AM to 6 PM

        T_external = external_temp_func(timestamp)
        solar_gain = solar_gain_func(timestamp) if is_daytime else 0

        if is_daytime:
            T_internal = daytime_temp(T_external, solar_gain, THERMAL_MASS, U_DAY, AREA, T_internal)
        else:
            Q_thermal = HEATING_POWER
            Q_loss = U_NIGHT * AREA * (T_internal - T_external)
            T_internal = nighttime_temp(T_internal, Q_thermal, Q_loss, THERMAL_MASS)

        temperatures.append((timestamp, T_internal))

    return pd.DataFrame(temperatures, columns=['Timestamp', 'Internal Temperature (°C)'])

# sinusoidal variation
def external_temp_func(timestamp):
    amplitude = 20
    mean_temp = 10
    hour = timestamp.hour
    return mean_temp + amplitude * np.sin(2 * np.pi * hour / 24)

def solar_gain_func(timestamp):
    hour = timestamp.hour
    return SOLAR_GAIN * np.sin(np.pi * (hour - 6) / 12) if 6 <= hour < 18 else 0

start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 1, 2)
initial_temp = 20  # Initial internal temperature in C

hourly_temps = calculate_hourly_temperatures(start_date, end_date, initial_temp, external_temp_func, solar_gain_func)
print(hourly_temps)