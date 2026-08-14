from fastapi import APIRouter, Response, HTTPException, status, Depends
from app.core.config import settings
from app.core.auth import authenticate_user, create_session_token, get_current_user
from app.schemas.auth import LoginRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate with username and password, setting an HTTP-only session cookie.",
)
def login(login_data: LoginRequest, response: Response):
    user = authenticate_user(login_data.identifier, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Create signed session token
    token = create_session_token({"username": user["username"], "user_id": user["id"]})

    # Set HTTP-only cookie with environment-aware SameSite and Secure flags
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        path="/",
    )

    return user


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="User Logout",
    description="Clear session cookie and log the user out.",
)
def logout(response: Response):
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Current User Profile",
    description="Retrieve currently authenticated user session details.",
)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

