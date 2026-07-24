import uuid
from contextvars import ContextVar

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


def new_request_id() -> str:
    rid = str(uuid.uuid4())
    request_id_ctx.set(rid)
    return rid


def get_request_id() -> str:
    return request_id_ctx.get()