from fastapi import FastAPI
from pydantic import BaseModel
from src.main import calculate_hourly_temperatures
from src.utils.fetch_weather import fetch_weather

app = FastAPI()

class SimulationInput(BaseModel):
    city: str
    start_date: str
    end_date: str

@app.get("/")
def root():
    return {"message": "Simulation API is running!"}

@app.post("/simulate")
def simulate(params: SimulationInput):
    weather_df = fetch_weather(params.city, params.start_date, params.end_date)
    hourly_temps = calculate_hourly_temperatures(weather_df)
    hourly_temps["Timestamp"] = hourly_temps["Timestamp"].astype(str)
    response_data = hourly_temps.to_dict(orient="records")
    return {"status": "success", "data": response_data}
