import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import types
import asyncio
import json
# Stub external dependencies not installed in the test environment
if 'dotenv' not in sys.modules:
    dotenv_stub = types.ModuleType('dotenv')
    dotenv_stub.load_dotenv = lambda *args, **kwargs: None
    sys.modules['dotenv'] = dotenv_stub

if 'supabase' not in sys.modules:
    supabase_stub = types.ModuleType('supabase')
    supabase_stub.create_client = lambda *args, **kwargs: object()
    sys.modules['supabase'] = supabase_stub

if 'email_validator' not in sys.modules:
    email_validator_stub = types.ModuleType('email_validator')
    def validate_email(email, *args, **kwargs):
        return '', email
    email_validator_stub.validate_email = validate_email
    sys.modules['email_validator'] = email_validator_stub

from app.main import app

async def make_request(app, method: str, path: str):
    scope = {
        'type': 'http',
        'method': method,
        'path': path,
        'headers': [],
        'query_string': b'',
        'server': ('testserver', 80),
        'client': ('testclient', 50000),
    }
    messages = []

    async def receive():
        return {'type': 'http.request', 'body': b'', 'more_body': False}

    async def send(message):
        messages.append(message)

    await app(scope, receive, send)

    status_code = None
    body = b''
    for message in messages:
        if message['type'] == 'http.response.start':
            status_code = message['status']
        elif message['type'] == 'http.response.body':
            body += message.get('body', b'')
    return status_code, body


def test_healthz():
    status, body = asyncio.run(make_request(app, 'GET', '/healthz'))
    assert status == 200
    assert json.loads(body.decode()) == {'status': 'ok'}
