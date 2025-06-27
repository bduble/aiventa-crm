from types import SimpleNamespace
from urllib.parse import urljoin, urlparse

class URL:
    def __init__(self, url: str):
        parsed = urlparse(url)
        self.scheme = parsed.scheme
        self.netloc = parsed.netloc.encode()
        self.path = parsed.path
        self.raw_path = parsed.path.encode()
        self.query = parsed.query.encode()
        self._url = url

    def join(self, other: str) -> "URL":
        return URL(urljoin(self._url if self._url.endswith('/') else self._url + '/', other))

    def __str__(self) -> str:
        return self._url

USE_CLIENT_DEFAULT = object()

class BaseTransport:
    def handle_request(self, request):
        raise NotImplementedError()

class ByteStream:
    def __init__(self, data=b""):
        self._data = data
    def read(self):
        return self._data

class Request:
    def __init__(self, method, url, headers=None, data=None):
        self.method = method
        self.url = URL(url)
        self.headers = headers or {}
        self._data = data or b""
    def read(self):
        return self._data

class Response:
    def __init__(self, *, status_code=200, headers=None, stream=None, request=None):
        self.status_code = status_code
        self.headers = dict(headers or [])
        self._content = stream.read() if stream else b""
        self.request = request
    def json(self):
        import json
        return json.loads(self._content.decode()) if self._content else None
    @property
    def text(self):
        return self._content.decode()


class Headers(dict):
    pass


class QueryParams(dict):
    def add(self, key, value):
        self[key] = value
        return self


class BasicAuth:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

class Client:
    def __init__(self, *, app=None, base_url="", headers=None, transport=None, follow_redirects=True, cookies=None):
        # mimic httpx.Client by storing URL object with join()
        self.base_url = URL(base_url)
        self.headers = headers or {}
        self._transport = transport
        self.follow_redirects = follow_redirects
        self.cookies = cookies
        self.app = app

    def _merge_url(self, url: str) -> URL:
        return self.base_url.join(url)
    def request(self, method, url, **kwargs):
        merged = self._merge_url(str(url))
        full_url = str(merged)
        req = Request(method, full_url, headers=kwargs.get("headers"), data=kwargs.get("content"))
        # Debug print
        # print('Request built', full_url, req.url.netloc)
        return self._transport.handle_request(req)
    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)
    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)
    def put(self, url, **kwargs):
        return self.request("PUT", url, **kwargs)
    def delete(self, url, **kwargs):
        return self.request("DELETE", url, **kwargs)


class AsyncClient(Client):
    async def request(self, method, url, **kwargs):
        return super().request(method, url, **kwargs)
    async def get(self, url, **kwargs):
        return await self.request("GET", url, **kwargs)
    async def post(self, url, **kwargs):
        return await self.request("POST", url, **kwargs)
    async def put(self, url, **kwargs):
        return await self.request("PUT", url, **kwargs)
    async def delete(self, url, **kwargs):
        return await self.request("DELETE", url, **kwargs)
    async def __aenter__(self):
        return self
    async def __aexit__(self, exc_type, exc, tb):
        pass


class Timeout:
    def __init__(self, *args, **kwargs):
        self.connect = kwargs.get("connect")
        self.read = kwargs.get("read")
        self.write = kwargs.get("write")
        self.pool = kwargs.get("pool")

_client = SimpleNamespace(
    USE_CLIENT_DEFAULT=USE_CLIENT_DEFAULT,
    UseClientDefault=object,
    CookieTypes=object,
    Timeout=Timeout,
    TimeoutTypes=object,
    Headers=Headers,
    QueryParams=QueryParams,
    BasicAuth=BasicAuth,
)
_types = SimpleNamespace(
    URLTypes=str,
    RequestContent=bytes,
    RequestFiles=object,
    QueryParamTypes=object,
    HeaderTypes=object,
    CookieTypes=object,
    AuthTypes=object,
    TimeoutTypes=object,
    BasicAuth=BasicAuth,
)
