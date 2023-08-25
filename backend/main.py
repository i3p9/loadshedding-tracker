from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import dotenv_values
import pytz

config = dotenv_values(".env")
app = FastAPI()
client = MongoClient(config["MONGO_URI"])
db = client["fahims-testdb"]
collection = db["loadSheddingData"]

# status off: Power is cut
# status on: Power is restored

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/loadshedding", status_code=status.HTTP_201_CREATED)
def create_loadshedding(status: str, apiKey: str):
    if apiKey == config["ACCEPTED_KEY"]:
        if status.lower() == "on" or status.lower() == "off":
            timestamp = datetime.utcnow()
            document = {"status": status, "timestamp": timestamp}
            collection.insert_one(document)
            return {"message": "Data inserted successfully."}
        else:
            raise HTTPException(
                status_code=403, detail="Error: Status can either be ON or OFF"
            )
    else:
        raise HTTPException(status_code=403, detail="auth error")


@app.get("/loadshedding")
def get_loadshedding():
    last_month = datetime.utcnow() - timedelta(days=30)
    data = collection.find({"timestamp": {"$gte": last_month}})
    result = []
    for document in data:
        result.append(
            {"status": document["status"], "timestamp": document["timestamp"]}
        )
    return result


@app.get("/loadshedding/today")
def get_today_loadshedding(timezone: str):
    tz = pytz.timezone(timezone)
    today = datetime.now(tz).date()
    start_of_day = tz.localize(datetime.combine(today, datetime.min.time()))
    end_of_day = tz.localize(datetime.combine(today, datetime.max.time()))
    data = collection.find({"timestamp": {"$gte": start_of_day, "$lte": end_of_day}})
    result = []
    for document in data:
        result.append(
            {"status": document["status"], "timestamp": document["timestamp"]}
        )
    return result


@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    return {"message": "all OK"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
