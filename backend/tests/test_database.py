import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.models import (
    Base,
    User,
    SecurityEvent,
    DecoyResource,
    DecoySession,
    AiConversation,
)
from app.database.repository import (
    create_user,
    get_user_by_email,
    list_users,
    save_security_event,
    list_security_events,
    get_monitoring_summary_db,
    upsert_decoy_resource,
    get_decoy_resource,
    list_decoy_resources,
    record_canary_activation,
    register_decoy_session,
    terminate_decoy_session,
    log_ai_conversation,
    list_ai_conversations,
)


@pytest.fixture
def db_session():
    """Create an isolated SQLite in-memory test database for unit tests."""
    test_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


def test_user_creation_and_retrieval(db_session):
    admin = create_user(
        db=db_session,
        email="admin@gmail.com",
        password_hash="test_admin_hash",
        role="super_admin",
        account_mode="genuine",
    )
    assert admin.id is not None
    assert admin.email == "admin@gmail.com"
    assert admin.account_mode == "genuine"

    fetched = get_user_by_email(db_session, "admin@gmail.com")
    assert fetched is not None
    assert fetched.role == "super_admin"

    users = list_users(db_session)
    assert len(users) == 1


def test_decoy_resource_and_canary_activation(db_session):
    canary = upsert_decoy_resource(
        db=db_session,
        resource_id="DECOY-001",
        name="Confidential_Strategy_DRAFT.pdf",
        resource_type="document",
        classification="Top Secret",
        fake_path="/var/secure/docs/Confidential_Strategy_DRAFT.pdf",
        canary_token="CANARY_TOKEN_STRAT_2026_X9",
        metadata_json={"file_size": "2.4 MB"},
    )
    assert canary.activation_count == 0

    activated = record_canary_activation(db_session, "DECOY-001")
    assert activated is not None
    assert activated.activation_count == 1
    assert activated.last_activated_at is not None

    record_canary_activation(db_session, "DECOY-001")
    updated = get_decoy_resource(db_session, "DECOY-001")
    assert updated.activation_count == 2


def test_security_event_filtering(db_session):
    save_security_event(
        db_session,
        {
            "id": "EVT-TEST1",
            "event_type": "login_succeeded",
            "severity": "low",
            "environment": "genuine",
            "message": "Admin signed in",
            "source": "192.168.1.100",
        },
    )
    save_security_event(
        db_session,
        {
            "id": "EVT-TEST2",
            "event_type": "decoy_token_activation",
            "severity": "critical",
            "environment": "decoy",
            "message": "Honey-token DECOY-001 opened",
            "source": "10.0.0.5",
        },
    )

    all_events = list_security_events(db_session)
    assert len(all_events) == 2

    critical_events = list_security_events(db_session, severity="critical")
    assert len(critical_events) == 1
    assert critical_events[0]["id"] == "EVT-TEST2"

    filtered_type = list_security_events(db_session, event_type="login_succeeded")
    assert len(filtered_type) == 1
    assert filtered_type[0]["id"] == "EVT-TEST1"

    searched = list_security_events(db_session, search="Honey-token")
    assert len(searched) == 1
    assert searched[0]["id"] == "EVT-TEST2"


def test_monitoring_summary_db(db_session):
    save_security_event(
        db_session,
        {
            "id": "EVT-SUM-1",
            "event_type": "login_succeeded",
            "severity": "low",
            "environment": "genuine",
            "message": "Login success",
        },
    )
    save_security_event(
        db_session,
        {
            "id": "EVT-SUM-2",
            "event_type": "decoy_token_activation",
            "severity": "critical",
            "environment": "decoy",
            "message": "Canary activated",
        },
    )

    summary = get_monitoring_summary_db(db_session)
    assert summary["metrics"]["authentication_attempts"] == 1
    assert summary["metrics"]["successful_logins"] == 1
    assert summary["metrics"]["honey_token_activations"] == 1
    assert summary["metrics"]["high_severity_events"] == 1


def test_decoy_session_lifecycle(db_session):
    sess = register_decoy_session(
        db=db_session,
        session_id="SESS-INTRUDER-99",
        subject="intruder@simulated.local",
        client_ip="185.220.101.5",
    )
    assert sess.is_active is True
    assert sess.expires_at is not None

    terminated = terminate_decoy_session(db_session, "SESS-INTRUDER-99")
    assert terminated is True

    updated_sess = db_session.get(DecoySession, "SESS-INTRUDER-99")
    assert updated_sess.is_active is False


def test_ai_conversation_logging(db_session):
    conv = log_ai_conversation(
        db=db_session,
        prompt="Explain canary tokens",
        response="Canary tokens are trap credentials...",
        model="gemini-2.5-flash",
        source="gemini",
        user_email="analyst@tokentrap.io",
    )
    assert conv.id is not None
    assert conv.user_email == "analyst@tokentrap.io"

    conversations = list_ai_conversations(db_session)
    assert len(conversations) == 1
    assert conversations[0].prompt == "Explain canary tokens"
