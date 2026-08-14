from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.core.config import settings

# Session serializer
serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


def get_mock_user() -> Dict[str, Any]:
    """Construct mock user record from current settings."""
    return {
        "id": 1,
        "username": settings.MOCK_USER_USERNAME,
        "email": settings.MOCK_USER_EMAIL,
        "full_name": "Route 53 Administrator",
        "is_active": True,
    }


def authenticate_user(identifier: Optional[str], password: Optional[str]) -> Optional[Dict[str, Any]]:
    """Verify mock user credentials against configured username or email."""
    if not identifier or not password:
        return None

    cleaned_id = identifier.strip().lower()
    valid_ids = {
        settings.MOCK_USER_USERNAME.strip().lower(),
        settings.MOCK_USER_EMAIL.strip().lower(),
    }

    if cleaned_id in valid_ids and password == settings.MOCK_USER_PASSWORD:
        return get_mock_user()
    return None


def create_session_token(data: Dict[str, Any]) -> str:
    """Create a signed, timed session token."""
    return serializer.dumps(data)


def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify session token signature and expiration."""
    try:
        max_age = settings.SESSION_EXPIRE_HOURS * 3600
        data = serializer.loads(token, max_age=max_age)
        return data
    except (BadSignature, SignatureExpired):
        return None


def get_current_user(request: Request) -> Dict[str, Any]:
    """Dependency to retrieve and validate authenticated user from HTTP-only cookie."""
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing session cookie.",
        )

    payload = verify_session_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session.",
        )

    return get_mock_user()

