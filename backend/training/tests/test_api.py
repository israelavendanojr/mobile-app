import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from training.models import UserPreferences

User = get_user_model()

@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", email="test@example.com", password="password123")

@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

def test_preferences_create_or_update(auth_client):
    payload = {
        "days_per_week": 4,
        "training_age": 1,
        "volume": "moderate",
        "priority_muscles": [],
        "bodyweight_exercises": "bodyweight",
        "equipment": []
    }

    response = auth_client.post("/api/preferences/save/", payload, format="json")
    assert response.status_code == 200
    assert response.data["days_per_week"] == 4

def test_generate_plan_preview(auth_client):
    payload = {
        "days_per_week": 3,
        "training_age": 1,
        "volume": "moderate",
        "priority_muscles": [],
        "bodyweight_exercises": "bodyweight",
        "equipment": []
    }

    response = auth_client.post("/api/plan/preview/", payload, format="json")
    assert response.status_code == 200
    assert "days" in response.data

def test_generate_plan_with_invalid_input(auth_client):
    # Missing days_per_week
    payload = {
        "training_age": 1,
        "volume": "moderate",
        "priority_muscles": [],
        "bodyweight_exercises": "bodyweight",
        "equipment": []
    }

    response = auth_client.post("/api/plan/preview/", payload, format="json")
    assert response.status_code == 400
    assert "days_per_week" in response.data

def test_save_plan(auth_client):
    preview_payload = {
        "name": "Test Plan",
        "days_per_week": 2,
        "days": [
            {
                "day_name": "Day 1",
                "exercises": [
                    {
                        "exercise_name": "Push-Up",
                        "sets": 3,
                        "start_reps": 8,
                        "end_reps": 12,
                        "skip": False
                    }
                ]
            }
        ]
    }

    response = auth_client.post("/api/plan/save/", preview_payload, format="json")
    assert response.status_code == 201
    assert "id" in response.data

def test_get_preferences(auth_client):
    # First create some preferences
    test_preferences_create_or_update(auth_client)
    
    response = auth_client.get("/api/preferences/get/")
    assert response.status_code == 200
    assert "days_per_week" in response.data

