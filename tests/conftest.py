import sys
import types
from unittest.mock import MagicMock

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
    supabase_module.create_client = create_client
    sys.modules['supabase'] = supabase_module

# Provide stub httpx module if missing
if 'httpx' not in sys.modules:
    import importlib
    httpx_stub = importlib.import_module('tests.httpx_stub')
    sys.modules['httpx'] = httpx_stub
    sys.modules['httpx._client'] = httpx_stub._client
    sys.modules['httpx._types'] = httpx_stub._types

# Provide dummy email_validator module if missing
if 'email_validator' not in sys.modules:
    email_validator = types.ModuleType('email_validator')
    class EmailNotValidError(ValueError):
        pass
    def validate_email(email, check_deliverability=True):
        return ({'email': email}, email)
    email_validator.EmailNotValidError = EmailNotValidError
    email_validator.validate_email = validate_email
    sys.modules['email_validator'] = email_validator
