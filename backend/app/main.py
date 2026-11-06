from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import Settings, get_settings
from app.database import check_database_connection, get_engine
from app.notice_schema import ParseRequest, ParsedNotice
from app.notice_parser import InvalidModelOutput, ModelUnavailable, parse_notice


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if get_engine.cache_info().currsize:
        get_engine().dispose()
        get_engine.cache_clear()


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)


@app.post("/api/notices/parse", response_model=ParsedNotice, tags=["notices"])
async def parse_notification(body: ParseRequest, settings: Settings = Depends(get_settings)):
    """发送通知给模型解析；不保存数据。结果需要人工核对。"""
    if not settings.llm_api_key.get_secret_value().strip():
        return JSONResponse(status_code=503, content={
            "status": "not_configured", "detail": "请在本地 .env 配置模型密钥。"
        })
    try:
        return await parse_notice(body.text, settings)
    except ModelUnavailable:
        return JSONResponse(status_code=502, content={
            "status": "model_unavailable", "detail": "模型调用失败，请检查配置、网络或额度后重试。"
        })
    except InvalidModelOutput:
        return JSONResponse(status_code=502, content={
            "status": "invalid_model_output", "detail": "模型结果格式或原文引用校验失败，请重试并核对原文。"
        })


@app.get("/health", tags=["health"])
def health():
    """Process health; does not imply the database is available."""
    return {"status": "ok"}


@app.get("/health/db", tags=["health"])
def database_health(settings: Settings = Depends(get_settings)):
    if not settings.database_configured:
        return JSONResponse(
            status_code=503,
            content={"status": "not_configured", "detail": "数据库配置不完整，请检查本地 .env。"},
        )
    try:
        check_database_connection()
    except SQLAlchemyError:
        # Never return raw driver exceptions: they can expose connection details.
        return JSONResponse(
            status_code=503,
            content={"status": "unavailable", "detail": "数据库连接失败，请检查服务、数据库和账号配置。"},
        )
    return {"status": "ok", "database": "connected"}
