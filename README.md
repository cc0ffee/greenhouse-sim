# Solar Greenhouse Simulation
Estimate the internal temperature of a [Chinese Solar Greenhouse](https://www.appropedia.org/Chinese_Solar_Greenhouse)
based on weather data (real-time, forecast, historical).

### Overview

This repository features the following:
- worker that runs the simulation
- cli runner to run locally
- backend from Spring 2025 that runs simulation and gives it to frontend
- frontend dashboard

As of now, the more accurate simulation is provided within the worker directory. This along with the CLI runner will return the results via `matplotlib`.


### How to run?

There are two ways: running it through Python itself or Docker.

#### Python

1. Enter the directory `worker`
2. `pip install -r requirements.txt`
3. `python3 cli_runner.py`

#### Docker

1. The Dockerfile is within `worker` directory.

Both are ran off the `configs/default.json` file with the parameters there, feel free to change there to get different results!

### Future Goals

Since working on it, we weren't able to provide the worker simulation to the frontend due to time constraints and some errors. Ideally we want a dashboard for others to use rather than just a python file.

- [] Improve any inaccuracies in the simulation

- [] Provide frontend dashboard from the worker instead of the original backend implementation

- [] Be able to let users give parameters to it whilst saving results (Redis)