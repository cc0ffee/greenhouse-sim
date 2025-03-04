# Solar Greenhouse Simulation
Estimate the internal temperature of a [Chinese Solar Greenhouse](https://www.appropedia.org/Chinese_Solar_Greenhouse)
based on weather data (real-time, forecast, historical).

### Overview

#### Goals

We were given a report from the previous group with formulas of how to calculate the internal temperatures of a solar greenhouse. What we want to do now is apply it to real-time data and automate the process. The main goals are:

- Use the report's information against real-time data
- Optimize formulas to provide variable values
- Get to run simulations for other groups

#### Parameters and Formulas
- Solar Gain
- Heating Power
- U_Value (Daytime)
- U_Value (Nighttime)
- External Daytime Temp
- Internal Nighttime Temp

### Run/Build
1. Install pip package dependencies: `pip install -r ./requirements.txt`
2. Run `test_simulation.py`

### To-Do
- [ ] Fix/Tweak formulas
- [ ] Be able to change materials / other params
- [ ] Make tests against previous group's results
- [x] Get temperature from library / data
- [x] Graphs/Visuals, possibly from matplotlib
- [ ] 10 degrees sunrise/sunset
- [ ] easy-to-use CLI / Website for others to test on
- [ ] organize and document code

### Acknowledgements
