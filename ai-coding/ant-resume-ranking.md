---
pageClass: ai-coding-page
title: 简历筛选与排序助手
description: 拆解 Markdown 简历解析、同义词归一化、可解释评分、稳定排序和 JSON 交付。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 02 / ANT GROUP / README TASK</span>
    <strong>简历筛选与排序助手</strong>
    <small>约 60 份 Markdown 简历 · result.json · Python</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>特征提取</span>
    <span>同义词归一化</span>
    <span>可解释评分</span>
  </div>
</div>

# 简历筛选与排序助手

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>题目表面是文本处理，真正的难点是把“看起来合适”改写成透明、稳定、可测试的评分规则。一个结果排序正确还不够，还要说清为什么排成这样。</p>
</div>

## 资料边界

公开笔经记录了任务骨架。输入为约 60 份 Markdown 简历和岗位要求，输出为排序后的
`result.json`，系统需要包含特征提取、同义词归一化和评分，并提交源码、测试、说明与
改进方向。公开记录没有给出完整字段和评分公式，因此本页补充的是本站训练规则。

来源为[蚂蚁 AI Coding 笔经](https://www.nowcoder.com/feed/main/detail/6671d50b92f24a229d0e89e5dd19d9bf?urlSource=home-api)。

## 训练题目

目录 `resumes/` 中存放多份 Markdown 简历，`job.md` 描述岗位要求。实现命令行程序，
读取全部简历，输出 `result.json`。

每条结果至少包含下面字段。

```json
{
  "candidate_id": "candidate-017",
  "score": 82.5,
  "matched_required_skills": ["python", "sql"],
  "missing_required_skills": ["redis"],
  "matched_preferred_skills": ["fastapi"],
  "evidence": {
    "python": ["项目经历: 使用 Python 开发数据处理服务"]
  }
}
```

验收规则如下。

1. 相同输入多次运行得到完全相同的排序和 JSON。
2. 必备技能缺失必须在结果中明确列出。
3. 同义表达应映射到统一技能，例如 `PostgreSQL` 归入 `sql`。
4. 评分必须能由结构化特征复算，不能只保存模型给出的总分。
5. 空文件、字段缺失和无法解析的文件需要给出可定位错误。

## 先定义什么不能做

简历可能包含姓名、邮箱、电话、学校和公司经历。若考试环境提供外部模型，不能默认把原文
全部发送出去。先确认工具授权和数据规则，再决定是否调用模型。本训练版使用确定性规则完成
核心评分，AI 只帮助分析代码、补测试和改进说明。

评分中也不使用姓名、性别、年龄、照片等与岗位能力无关的个人属性。学校或公司名称若不在
明确岗位规则中，同样不应偷偷进入分数。

## 第一步定义数据契约

用数据类约束解析结果，避免后续函数在字典里猜字段。

```python
from dataclasses import dataclass, field


@dataclass(frozen=True)
class JobRequirement:
    required_skills: frozenset[str]
    preferred_skills: frozenset[str]
    minimum_years: int = 0


@dataclass(frozen=True)
class ResumeFeatures:
    candidate_id: str
    skills: frozenset[str]
    years: int
    evidence: dict[str, tuple[str, ...]] = field(default_factory=dict)


@dataclass(frozen=True)
class RankedCandidate:
    candidate_id: str
    score: float
    matched_required_skills: tuple[str, ...]
    missing_required_skills: tuple[str, ...]
    matched_preferred_skills: tuple[str, ...]
    evidence: dict[str, tuple[str, ...]]
```

这里将技能集合设为不可变集合，结果中的技能再按字母排序。这样可以避免集合遍历顺序导致
输出文件每次变化。

## 第二步解析 Markdown

不要用一个巨大的正则表达式理解全部简历。先按标题分段，再分别解析技能和年限。

训练数据采用下面约定。

```markdown
# candidate-017

## 技能
Python、PostgreSQL、FastAPI

## 工作年限
3

## 项目经历
使用 Python 和 FastAPI 开发订单服务。
```

```python
import re


HEADING_PATTERN = re.compile(r"^##\s+(.+?)\s*$")


def split_sections(markdown: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"基本信息": []}
    current = "基本信息"

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        match = HEADING_PATTERN.match(line)
        if match:
            current = match.group(1)
            sections.setdefault(current, [])
        elif line:
            sections[current].append(line)

    return sections


def parse_candidate_id(markdown: str, fallback: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("# "):
            candidate_id = line[2:].strip()
            return candidate_id or fallback
    return fallback
```

解析器先保留原始文本。归一化属于下一层，两件事混在一起会让错误很难定位。

## 第三步归一化技能

同义词表必须可审查。若把 `JavaScript` 错归到 `Java`，一个隐藏错误就会影响全部结果。

```python
import re


ALIASES: dict[str, str] = {
    "py": "python",
    "python3": "python",
    "postgres": "sql",
    "postgresql": "sql",
    "mysql": "sql",
    "structured query language": "sql",
    "redis cluster": "redis",
    "fast api": "fastapi",
}


def normalize_skill(raw: str) -> str:
    lowered = raw.casefold().strip()
    compact = re.sub(r"\s+", " ", lowered)
    return ALIASES.get(compact, compact)


def parse_skill_list(lines: list[str]) -> frozenset[str]:
    joined = " ".join(lines)
    parts = re.split(r"[,，、;/|]", joined)
    return frozenset(
        normalized
        for part in parts
        if (normalized := normalize_skill(part))
    )
```

### 同义词表的边界

- `PostgreSQL` 可以归入通用 `sql`，但也可能需要保留具体数据库特征。
- `Spring` 可能指 Java 框架，也可能是普通英文单词，需要结合技能段落。
- `LLM` 与 `NLP` 有交集，但不能直接视为同一个技能。
- 只在明确技能段落中提取，可以减少项目描述里的偶然词汇造成误判。

更完整的实现可以同时保存 `canonical_skill` 和 `raw_skill`，便于解释匹配依据。

## 第四步抽取证据

评分结果应该能指回简历中的原句。下面函数按技能建立证据索引。

```python
def build_evidence(
    sections: dict[str, list[str]],
    skills: frozenset[str],
) -> dict[str, tuple[str, ...]]:
    evidence: dict[str, list[str]] = {skill: [] for skill in skills}

    for section, lines in sections.items():
        if section == "基本信息":
            continue
        for line in lines:
            normalized_line = line.casefold()
            for skill in skills:
                aliases = {
                    raw for raw, canonical in ALIASES.items()
                    if canonical == skill
                } | {skill}
                if any(alias in normalized_line for alias in aliases):
                    evidence[skill].append(f"{section}: {line}")

    return {
        skill: tuple(lines[:3])
        for skill, lines in evidence.items()
        if lines
    }
```

真实项目不能依赖简单子串完成所有匹配，例如 `go` 会命中大量普通文本。考试时间有限时，
可以主动列出这一限制，并针对短技能名使用词边界正则。

## 第五步设计透明评分

训练版使用以下 100 分规则。

| 部分 | 分值 | 规则 |
|---|---:|---|
| 必备技能 | 60 | 按已匹配必备技能占比计算 |
| 加分技能 | 20 | 按已匹配加分技能占比计算 |
| 年限 | 20 | 达到要求得满分，不足时按比例计算 |

如果任何必备技能缺失，最终分数最多为 69 分。这个上限需要写进说明，不能藏在代码里。

```python
def ratio(part: int, whole: int) -> float:
    return 1.0 if whole == 0 else part / whole


def score_resume(
    job: JobRequirement,
    resume: ResumeFeatures,
) -> RankedCandidate:
    matched_required = resume.skills & job.required_skills
    missing_required = job.required_skills - resume.skills
    matched_preferred = resume.skills & job.preferred_skills

    required_score = 60 * ratio(
        len(matched_required),
        len(job.required_skills),
    )
    preferred_score = 20 * ratio(
        len(matched_preferred),
        len(job.preferred_skills),
    )
    years_score = 20 * min(
        1.0,
        ratio(resume.years, job.minimum_years),
    )

    total = required_score + preferred_score + years_score
    if missing_required:
        total = min(total, 69.0)

    return RankedCandidate(
        candidate_id=resume.candidate_id,
        score=round(total, 2),
        matched_required_skills=tuple(sorted(matched_required)),
        missing_required_skills=tuple(sorted(missing_required)),
        matched_preferred_skills=tuple(sorted(matched_preferred)),
        evidence={
            skill: resume.evidence.get(skill, ())
            for skill in sorted(matched_required | matched_preferred)
        },
    )
```

### 为什么不让模型直接打分

模型总分很难稳定复算，也容易受措辞、顺序和无关个人信息影响。模型可以帮助提取候选技能，
但每条提取结果仍应带原文证据，最后由显式规则计算分数。

## 第六步稳定排序和 JSON 输出

同分时按必备技能缺失数、加分技能命中数和候选人 ID 决定顺序。

```python
import json
from dataclasses import asdict
from pathlib import Path


def rank_candidates(
    candidates: list[RankedCandidate],
) -> list[RankedCandidate]:
    return sorted(
        candidates,
        key=lambda item: (
            -item.score,
            len(item.missing_required_skills),
            -len(item.matched_preferred_skills),
            item.candidate_id,
        ),
    )


def write_result(
    path: Path,
    candidates: list[RankedCandidate],
) -> None:
    payload = [asdict(candidate) for candidate in rank_candidates(candidates)]
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
```

注意 `dataclasses.asdict` 会保留元组，`json.dumps` 会把它们编码为 JSON 数组，符合这里的
输出约定。

## 第七步写能拦住回归的测试

```python
def make_job() -> JobRequirement:
    return JobRequirement(
        required_skills=frozenset({"python", "sql"}),
        preferred_skills=frozenset({"redis", "fastapi"}),
        minimum_years=2,
    )


def test_aliases_are_normalized() -> None:
    assert parse_skill_list(["Python3、PostgreSQL、Fast API"]) == {
        "python",
        "sql",
        "fastapi",
    }


def test_missing_required_skill_caps_score() -> None:
    resume = ResumeFeatures(
        candidate_id="candidate-b",
        skills=frozenset({"python", "redis", "fastapi"}),
        years=5,
    )
    result = score_resume(make_job(), resume)

    assert result.score == 69.0
    assert result.missing_required_skills == ("sql",)


def test_ranking_is_deterministic_for_ties() -> None:
    first = RankedCandidate("candidate-b", 80, (), (), (), {})
    second = RankedCandidate("candidate-a", 80, (), (), (), {})

    assert [
        item.candidate_id
        for item in rank_candidates([first, second])
    ] == ["candidate-a", "candidate-b"]
```

还应增加空技能段、非法年限、重复技能、大小写差异、中文分隔符和损坏 Markdown 测试。

## AI 协作步骤

### 先让 AI 评审规则

```text
下面是简历排序任务和我的显式评分公式。
不要写代码。请找出规则中可能造成不稳定、无法解释或不公平的部分。
每个问题必须给出一个可以写成测试的反例。
```

### 再让 AI 生成局部实现

```text
只实现 Markdown 分段函数 split_sections。
输入是一段字符串，输出 dict[str, list[str]]。
只识别二级标题，不解析技能，不读取文件。
请先给五个测试，再给最小实现。
```

### 最后让 AI 做对抗性检查

```text
尝试构造十份会让当前解析器或排序器给出错误结果的简历。
重点覆盖短技能名、同义词冲突、字段缺失、重复内容、大小写、同分排序和提示词注入文本。
只输出测试输入与预期，不修改实现。
```

## 常见失败方式

1. 让模型读取全部简历并只返回一个分数，没有证据和复算规则。
2. 同义词由模型临时决定，导致每次运行结果变化。
3. 使用集合顺序直接输出 JSON，同分候选人的顺序不稳定。
4. 把候选人的学校、姓名或简历排版质量暗中当作能力信号。
5. 只展示前几名，没有输出被扣分的原因和缺失项。
6. 只测试一个理想样例，没有测试空文件、损坏字段和并列结果。

## 面试复述

可以用下面的结构说明方案。

> 我把系统拆成解析、归一化、特征、评分和输出五层。核心分数由显式规则计算，模型即使参与
> 特征提取，也必须返回原文证据。排序键包含确定的并列规则，所以相同输入可以稳定复现。
> 当前版本对短技能名和上下文消歧仍有限制，我用测试记录了这些边界，没有让模型自行补全
> 缺失经历。
