from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Event Booking Platform backend is running."}


def test_create_event():
    response = client.post("/api/v1/events/", json={
        "code": "EVT001",
        "name": "Demo Event",
        "description": "A placeholder event for test"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "EVT001"
    assert "id" in data
