from fastapi import FastAPI
from pydantic import BaseModel
from app.main import calculate_hourly_temperatures
from app.utils.fetch_weather import fetch_weather

app = FastAPI()

class SimulationInput(BaseModel):
    city: str
    start_date: str
    end_date: str

@app.get("/")
def root():
    return {"message": "Simulation API is running!"}

@app.get("/simulate")
def simulate(
    city: str,
    start_date: str,
    end_date: str):
    weather_df = fetch_weather(city, start_date, end_date)
    hourly_temps = calculate_hourly_temperatures(weather_df)
    hourly_temps["Timestamp"] = hourly_temps["Timestamp"].astype(str)
    response_data = hourly_temps.to_dict(orient="records")
    return {"status": "success", "data": response_data}
