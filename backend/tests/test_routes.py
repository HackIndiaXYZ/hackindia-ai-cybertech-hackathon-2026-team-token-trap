from fastapi.testclient import TestClient

from app.main import app
from app.auth.tokens import issue_token


client = TestClient(app)


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