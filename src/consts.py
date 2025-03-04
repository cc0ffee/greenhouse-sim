# These values should be remained UNCHANGED unless necessary.
# We will also include preset values here i.e. density and heat capacity for materials.

DEFAULT_LOCATION = "Chicago"

DEFAULT_GHI = 150
GREENHOUSE_AREA = 100
TRANSMISSION_EFFICIENCY=0.6
SOLAR_GAIN = None # Fix this

# Previous group defined heating power (W)
WATER_CIRCULATION_HEATING = 7000
THERMAL_ROCK_BED_STORAGE = 7000
EFFICIENCY = 0.8
HEATING_POWER = (WATER_CIRCULATION_HEATING + THERMAL_ROCK_BED_STORAGE) * EFFICIENCY 

### MATERIAL PRESETS ###
# density recorded in kg/m^3
# heat capacity recorded in J/(kg*K)

# STEEL
STEEL_DENSITY = 7850
STEEL_HEAT_CAPACITY = 420

# EXPANDED POLYSTYRENE (EPS)
EPS_DENSITY = 15 # "standard" density
EPS_HEAT_CAPACITY = 1300

# CONCRETE
CONCRETE_DENSITY = 2300 # "normal" concrete
CONCRETE_HEAT_CAPACITY = 1000