# These formulas have been defined from the previous group
# This file writes them as python function fron the equations
# so that we can use them for the simulation against real time
# temperatures. 

import numpy as np

def daytime_temp(T_external, solar_gain, thermal_mass, U_value, area, T_internal_prev):
    heat_loss = U_value * area * (T_external - T_internal_prev)
    T_internal = T_external + (solar_gain - heat_loss) / thermal_mass
    return T_internal

def nighttime_temp(T_external, thermal_power, thermal_mass, U_value, area, T_internal_prev):
    heat_loss = U_value * area * (T_external - T_internal_prev)
    T_internal = T_internal_prev + (thermal_power - heat_loss) / thermal_mass
    return T_internal

def solar_gain_func(solar_gain, hour):
    return solar_gain * np.sin(np.pi * (hour - 6) / 12) # mimics angle of sun

def thermal_mass_calculation(V_volume_layer, P_density, C_heat_capacity):
    return V_volume_layer * P_density * C_heat_capacity

# https://www.solarenergylocal.com/states/illinois/chicago/ to calculate solar gain