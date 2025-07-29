import sys
import types
import os
from unittest.mock import MagicMock

os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_KEY", "key")

# Provide dummy dotenv module if missing
if 'dotenv' not in sys.modules:
    dotenv = types.ModuleType('dotenv')
    def load_dotenv(*args, **kwargs):
        pass
    dotenv.load_dotenv = load_dotenv
    sys.modules['dotenv'] = dotenv

# Provide dummy supabase module if missing
if 'supabase' not in sys.modules:
    supabase_module = types.ModuleType('supabase')
    def create_client(*args, **kwargs):
        return MagicMock()
    class Client(MagicMock):
        pass
    supabase_module.create_client = create_client
    supabase_module.Client = Client
    sys.modules['supabase'] = supabase_module

# Provide stub httpx module when the installed version does not support the
# `app` parameter used by Starlette's TestClient. Older/lighter versions omit
# this argument which causes our tests to fail. We detect this at import time
# and swap in a minimal stub if needed so the tests can run without the real
# dependency.
try:
    import httpx  # noqa: F401
    import inspect
    if 'app' not in inspect.signature(httpx.Client.__init__).parameters:
        raise ImportError('httpx missing app support')
except Exception:  # pragma: no cover - fallback when httpx unavailable/incompatible
    import importlib
    httpx_stub = importlib.import_module('tests.httpx_stub')
    sys.modules['httpx'] = httpx_stub
    sys.modules['httpx._client'] = httpx_stub._client
    sys.modules['httpx._types'] = httpx_stub._types

# Provide dummy email_validator module if missing
# Use real 'email_validator' if available, otherwise minimal stub.
if 'email_validator' not in sys.modules:
    try:
        import email_validator  # noqa: F401
    except Exception:  # pragma: no cover
        email_validator = types.ModuleType('email_validator')
        class EmailNotValidError(ValueError):
            pass
        def validate_email(email, check_deliverability=True):
            return ({'email': email}, email)
        email_validator.EmailNotValidError = EmailNotValidError
        email_validator.validate_email = validate_email
        sys.modules['email_validator'] = email_validator
