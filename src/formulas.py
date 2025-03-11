# These formulas have been defined from the previous group
# This file writes them as python function fron the equations
# so that we can use them for the simulation against real time
# temperatures. 

# ATTENTION: We need to figure out how the thermal changes based on mat rolled down
# previous team just used 20% improvement, but let's be more accurate!

# T_ext + ((solar_gain - heat_loss)/total_thermal_mass)
def daytime_temp(T_external, solar_gain, thermal_mass, U_value, area, T_internal_prev):
    heat_loss = U_value * area * (T_internal_prev - T_external)
    T_internal = T_external + (solar_gain - heat_loss) / thermal_mass
    return T_internal

# t_int(prev_hour_temp) + ((Q_thermal - Q_loss)/total_thermal_mass)
def nighttime_temp(T_internal_prev, Q_thermal, Q_loss, thermal_mass):
    T_internal = T_internal_prev + (Q_thermal - Q_loss) / thermal_mass
    return T_internal

# Q = V_thickness * p_density * c_heat_capacity
def thermal_mass_calculation(V_volume_layer, P_density, C_heat_capacity):
    return V_volume_layer * P_density * C_heat_capacity

# https://www.solarenergylocal.com/states/illinois/chicago/ to calculate solar gain