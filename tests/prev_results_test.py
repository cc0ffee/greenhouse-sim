#   TEST AGAINST prev_results.csv FILE
#   This is the previous group's data that they have done mathematically
#   This test is to confirm that the formulas they provided are accurately
#   coded into the simulation python file. 
#   There is a margin of error allowed as we may include more parameters, but
#   it should just be close enough to it.

import pandas as pd

prev_results = pd.read_csv('data/previous_results.csv')
hourly_temps['Month'] = hourly_temps.groupby('Month')['Internal Temperature (°F)'].mean().reset_index()