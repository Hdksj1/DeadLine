from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
import json

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app


SOURCE = "校园比赛。仅限本科生。11月18日截止。提交演示视频。"


def sample():
    def fact(value, quote, status="extracted"):
        return {"value": value, "evidence": [quote], "status": status}
    return {
        "title": fact("校园比赛", "校园比赛"),
        "eligibility": [fact("本科生", "仅限本科生")],
        "deadlines": [fact("11月18日截止", "11月18日截止", "needs_confirmation")],
        "materials": [fact("演示视频", "提交演示视频")],
        "submission_methods": [],
        "issues": [{"question": "请确认截止年份、具体时刻及提交方式。", "evidence": ["11月18日截止"]}],
    }


@pytest.fixture
def client():
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None, llm_api_key="fake-test-key"
    )
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.clear()


def model_response(payload):
    return SimpleNamespace(content=json.dumps(payload, ensure_ascii=False))


def test_parse_success_preserves_uncertainty(client):
    with patch("app.notice_parser.make_model") as factory:
        factory.return_value.ainvoke = AsyncMock(return_value=model_response(sample()))
        response = client.post("/api/notices/parse", json={"text": SOURCE})
    assert response.status_code == 200
    assert response.json()["deadlines"][0]["status"] == "needs_confirmation"
    assert response.json()["submission_methods"] == []


@pytest.mark.parametrize("case", ["invented_quote", "invented_issue_quote", "invalid_structure", "invalid_json"])
def test_invalid_model_output_is_rejected(client, case):
    payload = sample()
    if case == "invented_quote":
        payload["materials"][0]["evidence"] = ["不存在的材料要求"]
    elif case == "invented_issue_quote":
        payload["issues"][0]["evidence"] = ["不存在的原文"]
    elif case == "invalid_structure":
        payload["title"] = {"value": "校园比赛", "evidence": [], "status": "extracted"}
    result = SimpleNamespace(content="not json") if case == "invalid_json" else model_response(payload)
    with patch("app.notice_parser.make_model") as factory:
        factory.return_value.ainvoke = AsyncMock(return_value=result)
        response = client.post("/api/notices/parse", json={"text": SOURCE})
    assert response.status_code == 502
    assert response.json()["status"] == "invalid_model_output"


def test_provider_failure_does_not_expose_secrets(client):
    with patch("app.notice_parser.make_model") as factory:
        factory.return_value.ainvoke = AsyncMock(side_effect=RuntimeError("secret-provider-token"))
        response = client.post("/api/notices/parse", json={"text": SOURCE})
    assert response.status_code == 502
    assert "secret-provider-token" not in response.text


def test_missing_key_never_calls_provider(client):
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None, llm_api_key="")
    with patch("app.notice_parser.make_model") as factory:
        assert client.post("/api/notices/parse", json={"text": SOURCE}).status_code == 503
        factory.assert_not_called()


@pytest.mark.parametrize("text", ["", "   ", "x" * 20001])
def test_bad_input_never_calls_provider(client, text):
    with patch("app.notice_parser.make_model") as factory:
        assert client.post("/api/notices/parse", json={"text": text}).status_code == 422
        factory.assert_not_called()
