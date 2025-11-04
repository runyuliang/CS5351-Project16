from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "simple-jira-backend"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_SECRET"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./dev.db"

    class Config:
        env_file = ".env"

settings = Settings()