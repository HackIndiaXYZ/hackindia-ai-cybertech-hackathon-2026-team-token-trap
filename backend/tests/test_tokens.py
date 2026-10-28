import pytest
from fastapi import HTTPException

from app.auth.tokens import issue_token, verify_token


def test_genuine_token_verifies_as_genuine():
    token = issue_token("admin-1", "genuine")
    claims = verify_token(token, "genuine")

    assert claims["sub"] == "admin-1"
    assert claims["token_type"] == "genuine"


def test_decoy_token_verifies_as_decoy():
    token = issue_token("visitor-1", "decoy")
    claims = verify_token(token, "decoy")

    assert claims["sub"] == "visitor-1"
    assert claims["token_type"] == "decoy"


def test_decoy_token_rejected_by_genuine_verifier():
    token = issue_token("visitor-1", "decoy")

    with pytest.raises(HTTPException) as exc:
        verify_token(token, "genuine")

    assert exc.value.status_code == 401


def test_genuine_token_rejected_by_decoy_verifier():
    token = issue_token("admin-1", "genuine")

    with pytest.raises(HTTPException) as exc:
        verify_token(token, "decoy")

    assert exc.value.status_code == 401