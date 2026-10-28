from fastapi.testclient import TestClient

from app.main import app
from app.auth.tokens import issue_token
from app.monitoring.events import list_events, get_monitoring_summary


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_admin_requires_token():
    response = client.get("/api/admin/overview")
    assert response.status_code == 401


def test_genuine_token_can_access_admin():
    token = issue_token("test-admin", "genuine")

    response = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["access"] == "genuine"


def test_decoy_token_cannot_access_admin():
    token = issue_token("test-visitor", "decoy")

    response = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


def test_genuine_token_cannot_access_decoy_endpoint():
    token = issue_token("test-admin", "genuine")

    response = client.get(
        "/api/decoy/documents",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


def test_decoy_token_can_access_decoy_endpoint():
    token = issue_token("test-visitor", "decoy")

    response = client.get(
        "/api/decoy/documents",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["access"] == "decoy"
    assert all(
        doc["classification"] == "SIMULATED DECOY DATA"
        for doc in response.json()["documents"]
    )


def test_decoy_resource_activation_valid():
    token = issue_token("test-visitor", "decoy")

    response = client.post(
        "/api/decoy/resources/DECOY-001/activate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "activated"
    assert data["resource_id"] == "DECOY-001"
    assert data["interaction_logged"] is True


def test_decoy_resource_activation_unknown_rejected():
    token = issue_token("test-visitor", "decoy")

    response = client.post(
        "/api/decoy/resources/UNKNOWN-RESOURCE/activate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_decoy_resource_activation_rejected_for_genuine_token():
    token = issue_token("test-admin", "genuine")

    response = client.post(
        "/api/decoy/resources/DECOY-001/activate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


def test_invalid_login_returns_401_and_records_event():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@gmail.com",
            "password": "wrong-password-xyz",
            "mode": "real",
        },
    )

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_valid_genuine_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@gmail.com",
            "password": "Password@123",
            "mode": "real",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"
    assert data["mode"] == "real"


def test_valid_decoy_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "visitor@gmail.com",
            "password": "Visitor@123",
            "mode": "decoy",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"
    assert data["mode"] == "decoy"



def test_monitoring_routes_require_genuine_token():
    decoy_token = issue_token("test-visitor", "decoy")
    genuine_token = issue_token("test-admin", "genuine")

    # Decoy cannot access monitoring events
    res_decoy = client.get(
        "/api/monitoring/events",
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert res_decoy.status_code == 401

    # Decoy cannot access monitoring summary
    res_decoy_sum = client.get(
        "/api/monitoring/summary",
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert res_decoy_sum.status_code == 401

    # Genuine can access monitoring events
    res_gen = client.get(
        "/api/monitoring/events",
        headers={"Authorization": f"Bearer {genuine_token}"},
    )
    assert res_gen.status_code == 200
    assert "events" in res_gen.json()

    # Genuine can access monitoring summary
    res_gen_sum = client.get(
        "/api/monitoring/summary",
        headers={"Authorization": f"Bearer {genuine_token}"},
    )
    assert res_gen_sum.status_code == 200
    assert "metrics" in res_gen_sum.json()


def test_event_records_do_not_contain_secrets():
    events = list_events(limit=50)
    for evt in events:
        assert "password" not in evt
        assert "password_hash" not in evt
        assert "access_token" not in evt
        assert "secret" not in evt
        assert "Authorization" not in evt


def test_ai_copilot_chat():
    response = client.post(
        "/api/ai/chat",
        json={"message": "What is TokenTrap and how do honey tokens work?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert "source" in data