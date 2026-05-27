import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-change-in-production")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"
def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


ALLOWED_HOSTS = [
    h.strip()
    for h in _env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,backend").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.core",
    "apps.ingestion",
    "apps.normalization",
    "apps.review",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

try:
    import whitenoise  # noqa: F401

    _cors_idx = MIDDLEWARE.index("corsheaders.middleware.CorsMiddleware")
    MIDDLEWARE.insert(_cors_idx + 1, "whitenoise.middleware.WhiteNoiseMiddleware")
except (ImportError, ValueError):
    pass

ROOT_URLCONF = "breathe_esg.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "breathe_esg.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "breathe_esg"),
        "USER": os.getenv("POSTGRES_USER", "breathe"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "breathe"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

def _should_use_sqlite() -> bool:
    explicit = os.getenv("USE_SQLITE", "").lower()
    if explicit == "true":
        return True
    if explicit == "false":
        return False
    # Render free tier: default to SQLite when no managed Postgres URL is provided.
    if os.getenv("RENDER") and not os.getenv("DATABASE_URL", "").strip():
        return True
    return False


if _should_use_sqlite():
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
else:
    _database_url = os.getenv("DATABASE_URL", "").strip()
    if _database_url:
        try:
            import dj_database_url

            DATABASES["default"] = dj_database_url.parse(_database_url, conn_max_age=600)
        except ImportError as exc:
            raise ImportError(
                "DATABASE_URL is set but dj-database-url is not installed. "
                "Run: pip install -r requirements.txt"
            ) from exc


def _parse_origin_list(env_name: str, default: str) -> list[str]:
    raw = _env(env_name, default)
    origins = []
    for part in raw.split(","):
        o = part.strip().rstrip("/")
        if o:
            origins.append(o)
    return origins

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SAMESITE = "None"
    # Needed when frontend and API are on different subdomains (e.g. Render).
    # Allows the frontend to read `csrftoken` and send `X-CSRFToken`.
    cookie_domain = _env("COOKIE_DOMAIN")
    if cookie_domain:
        SESSION_COOKIE_DOMAIN = cookie_domain
        CSRF_COOKIE_DOMAIN = cookie_domain

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = _parse_origin_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = _parse_origin_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

# Render: allow any *.onrender.com frontend (avoids CORS typos / trailing slashes)
if os.getenv("RENDER"):
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https://[a-zA-Z0-9-]+\.onrender\.com$",
    ]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

TRAVEL_FIXTURE_PATH = os.getenv(
    "TRAVEL_FIXTURE_PATH",
    str(BASE_DIR / "fixtures" / "mock_travel_response.json"),
)

DEFAULT_ORGANIZATION_NAME = os.getenv("DEFAULT_ORGANIZATION_NAME", "Default Client")
