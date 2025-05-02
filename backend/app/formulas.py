# These formulas have been defined from the previous group
# This file writes them as python function fron the equations
# so that we can use them for the simulation against real time
# temperatures. 

import numpy as np

def daytime_temp(T_internal_prev, solar_gain, U_value, area, T_external, thermal_mass, dt=3600):
    Q_loss = U_value * area * (T_internal_prev - T_external)
    dT = (solar_gain - Q_loss) * dt / thermal_mass
    return T_internal_prev + dT

def nighttime_temp(T_internal_prev, Q_thermal, U_value, area, T_external, thermal_mass, dt=3600):
    Q_loss = U_value * area * max(T_internal_prev - T_external, 0)  # only lose heat if internal > external
    net_energy = Q_thermal - Q_loss  # total heat input/output
    dT = net_energy * dt / thermal_mass  # ΔT = Q / (m·c)
    T_internal = T_internal_prev + dT

    # Optional: Clamp to reasonable physical range
    T_internal = max(-50, min(60, T_internal))
    return T_internal


#def solar_gain_func(solar_gain, hour):
#    return solar_gain * np.sin(np.pi * (hour - 6) / 12) # mimics angle of sun

def thermal_mass_calculation(V_volume_layer, P_density, C_heat_capacity):
    return V_volume_layer * P_density * C_heat_capacity

# https://www.solarenergylocal.com/states/illinois/chicago/ to calculate solar gain