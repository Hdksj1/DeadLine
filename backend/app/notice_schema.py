from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ParseRequest(StrictModel):
    text: str = Field(min_length=1, max_length=20000)


class EvidenceFact(StrictModel):
    value: str | None = Field(description="原文支持的结论；未说明时为 null")
    evidence: list[str] = Field(description="逐字复制的连续原文片段")
    status: Literal["extracted", "needs_confirmation", "not_stated"]

    @field_validator("evidence")
    @classmethod
    def reject_empty_quotes(cls, quotes: list[str]) -> list[str]:
        if any(not quote.strip() for quote in quotes):
            raise ValueError("Evidence must not be empty")
        return quotes

    @model_validator(mode="after")
    def check_consistency(self):
        if self.status == "not_stated":
            if self.value is not None or self.evidence:
                raise ValueError("Missing information must have null value and no evidence")
        elif not self.value or not self.evidence:
            raise ValueError("Extracted information requires a value and evidence")
        return self


class ConfirmationIssue(StrictModel):
    question: str = Field(min_length=1)
    evidence: list[str] = Field(description="相关原文；信息完全缺失时允许为空")


class ParsedNotice(StrictModel):
    title: EvidenceFact
    eligibility: list[EvidenceFact]
    deadlines: list[EvidenceFact] = Field(
        description="保留各时间的事项名称与原始日期表述，不自行补全年份、时刻或时区"
    )
    materials: list[EvidenceFact]
    submission_methods: list[EvidenceFact]
    issues: list[ConfirmationIssue]

    @model_validator(mode="after")
    def require_confirmation_issue(self):
        facts = [self.title, *self.eligibility, *self.deadlines,
                 *self.materials, *self.submission_methods]
        if any(f.status == "needs_confirmation" for f in facts) and not self.issues:
            raise ValueError("Uncertain information requires a confirmation question")
        return self
