---
title: 工具工程与权限边界
description: 系统讲解面向非确定性调用者的工具设计、Schema、策略引擎、最小权限、审批、沙箱和副作用治理。
---

# 02 · 工具工程与权限边界

模型能“说什么”主要影响答案质量；工具决定模型能“做什么”，直接改变系统风险。生产 Agent 的核心不是让模型学会更多 API，而是提供一组 **边界清晰、结果可解释、权限最小、失败可恢复** 的工具。

## 90 秒面试回答

我把模型视为不可信的动作提议者，不让它直接持有凭证或访问底层网络。每个工具都通过工具网关暴露，具有清晰名称、单一职责、严格 JSON Schema、有限输出、超时、幂等和风险等级。模型提出调用后，确定性策略引擎依据用户、租户、任务、资源和环境重新鉴权；涉及不可逆写入、外发或敏感数据时要求人工批准。

权限采用最小作用域和短时凭证，读写工具分离，网络、文件和进程能力放在沙箱中。工具返回面向下一步决策的结构化结果，而不是大段原始数据。对于 MCP 等外部工具服务器，工具描述和 annotations 都按不可信元数据处理，固定服务版本、验证来源、隔离 Token audience，禁止把客户端 Token 原样透传给下游。

## 为什么普通 API 不等于好工具

API 面向确定性程序，调用者知道字段含义和恢复逻辑；Agent 工具面向非确定性模型，必须额外降低选择和使用难度。

| 普通 API 常见设计 | Agent 工具需要补充 |
|---|---|
| 大而全的 CRUD | 按用户意图划分单一动作 |
| 参数依赖外部文档 | 在名称、描述和 Schema 中自解释 |
| 返回完整对象 | 返回完成下一步所需的最小信息 |
| 错误码面向程序员 | 可恢复、不可恢复、需审批等结构化错误 |
| 调用者自行鉴权 | 每次执行由网关重新检查身份和上下文 |
| 重试由客户端决定 | 明确幂等、超时和不确定提交语义 |

“执行 SQL”“发起 HTTP 请求”“运行 Shell”通常不是面向生产 Agent 的业务工具，而是过度开放的能力。

## 一份可用的工具契约

```python
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable


class RiskLevel(str, Enum):
    READ_ONLY = "read_only"
    REVERSIBLE_WRITE = "reversible_write"
    HIGH_RISK_WRITE = "high_risk_write"


@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    input_schema: dict[str, Any]
    risk: RiskLevel
    required_scopes: tuple[str, ...]
    timeout_seconds: float
    idempotent: bool
    handler: Callable[..., Any]


SEARCH_INCIDENTS = ToolSpec(
    name="incident.search",
    description=(
        "按时间范围和服务名查询事故记录。用于定位已有事故；"
        "不要用于查询实时指标，也不要传入自然语言 SQL。"
    ),
    input_schema={
        "type": "object",
        "additionalProperties": False,
        "required": ["service", "start_time", "end_time"],
        "properties": {
            "service": {
                "type": "string",
                "pattern": r"^[a-z][a-z0-9-]{1,62}$",
                "description": "规范化服务名，例如 payment-api",
            },
            "start_time": {"type": "string", "format": "date-time"},
            "end_time": {"type": "string", "format": "date-time"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 50, "default": 10},
        },
    },
    risk=RiskLevel.READ_ONLY,
    required_scopes=("incident:read",),
    timeout_seconds=5.0,
    idempotent=True,
    handler=lambda **kwargs: None,
)
```

关键细节：

- 名称用稳定命名空间避免冲突；
- 描述同时写“何时使用”和“何时不要使用”；
- `additionalProperties: false` 拒绝模型臆造参数；
- 字符串限制格式，数字限制范围；
- 不让模型传租户、用户或凭证，这些由可信上下文注入；
- 风险、作用域、超时和幂等性属于执行控制，不靠描述文本保证。

## 工具输出：给模型证据，不给数据倾倒

坏输出：

```json
{"rows": ["……数万行日志……"]}
```

更好的输出：

```json
{
  "status": "ok",
  "summary": "过去 30 分钟发现 2 次相同故障",
  "items": [
    {
      "incident_id": "INC-2048",
      "started_at": "2026-07-29T10:15:00Z",
      "service": "payment-api",
      "cause": "database connection pool exhausted",
      "evidence_ref": "obj://evidence/sha256:..."
    }
  ],
  "truncated": false,
  "next_cursor": null
}
```

输出应：

- 保留事实、来源、时间和内容哈希；
- 明确是否截断、是否还有下一页；
- 对模型提供简洁摘要，对审计保存原始证据引用；
- 区分“未找到”和“查询失败”；
- 不把内部异常堆栈、密钥、Cookie 或无关个人信息暴露给模型。

## 结构化错误

```python
from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class ToolError:
    code: str
    category: Literal[
        "invalid_input",
        "unauthorized",
        "conflict",
        "rate_limited",
        "temporary",
        "permanent",
        "unknown_commit",
    ]
    safe_message: str
    retryable: bool
    retry_after_ms: int | None = None
```

不要把所有错误直接返回成自然语言，让模型猜能否重试。尤其：

- `unauthorized` 不应由模型不断改参数绕过；
- `invalid_input` 可以给一次受限修正机会；
- `unknown_commit` 必须先查询提交状态；
- `rate_limited` 尊重服务端重试时间，并受总预算限制。

## 工具网关与策略引擎

正确的执行链：

```text
模型工具提案
  → 工具是否在当前任务允许清单
  → Schema 和业务参数验证
  → 解析可信身份与租户
  → 策略引擎评估资源、动作、环境
  → 审批 / 拒绝 / 签发短时能力
  → 沙箱或受控连接器执行
  → 输出过滤、审计和副作用核验
```

### Python 参考实现

```python
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class Principal:
    tenant_id: str
    user_id: str
    scopes: frozenset[str]


@dataclass(frozen=True)
class ExecutionContext:
    run_id: str
    purpose: str
    environment: str
    approved_action_hash: str | None = None


class ToolGateway:
    def __init__(self, registry, validator, policy, audit, executor):
        self.registry = registry
        self.validator = validator
        self.policy = policy
        self.audit = audit
        self.executor = executor

    def invoke(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        principal: Principal,
        context: ExecutionContext,
        idempotency_key: str,
    ) -> dict[str, Any]:
        spec = self.registry.get(tool_name)
        clean_args = self.validator.validate(spec.input_schema, arguments)

        missing = set(spec.required_scopes) - principal.scopes
        if missing:
            raise PermissionError(f"missing scopes: {sorted(missing)}")

        decision = self.policy.evaluate(
            principal=principal,
            action=tool_name,
            resource=derive_resource(tool_name, clean_args),
            environment={
                "purpose": context.purpose,
                "deployment": context.environment,
                "risk": spec.risk.value,
            },
        )
        self.audit.record_proposal(
            run_id=context.run_id,
            tool=tool_name,
            argument_digest=digest(clean_args),
            decision=decision.kind,
        )

        if decision.kind == "deny":
            raise PermissionError(decision.safe_reason)
        if decision.kind == "require_approval":
            raise ApprovalRequired(decision.request)

        # 凭证由可信网关临时获取，不放进模型上下文，也不接受模型传入。
        capability = issue_short_lived_capability(
            principal=principal,
            tool=spec,
            resource=decision.resource,
            ttl_seconds=min(decision.ttl_seconds, 300),
        )
        return self.executor.run(
            spec,
            clean_args,
            capability=capability,
            idempotency_key=idempotency_key,
        )
```

这个实现仍需要生产化的超时、并发限制、熔断和输出过滤，但边界已经正确：**模型不能指定身份、作用域、凭证或最终授权结果**。

## 最小权限不是一个布尔值

至少沿五个维度限制：

| 维度 | 示例 |
|---|---|
| 主体 | 具体用户、服务身份、租户 |
| 动作 | `invoice:read` 与 `invoice:approve` 分开 |
| 资源 | 只访问订单 `ORD-123`，不是全部订单 |
| 条件 | 仅生产只读、仅工作时间、金额小于阈值 |
| 时间 | 一次调用或 5 分钟后失效 |

建议使用短时、受众绑定的能力令牌。工具服务必须验证令牌是签给自己的，不能接受本应发给其他服务的 Token。

## 审批设计

审批 UI 至少展示：

- Agent 正在执行的目标；
- 工具名称和业务含义；
- 目标资源、关键参数和预计影响；
- 使用的数据来源；
- 动作能否撤销；
- 授权范围和有效期。

避免“允许 Agent 继续”这种过宽批准。正确做法是批准规范化后的单次动作：

```python
approval_payload = {
    "run_id": "run_public_example",
    "tool": "refund.submit",
    "resource": "order:ORD-123",
    "amount": "88.00",
    "currency": "CNY",
    "expires_at": "2026-07-29T11:00:00Z",
}

# 审批记录绑定内容摘要；任意字段变化都需要重新审批。
action_hash = digest(approval_payload)
```

## 沙箱与出站控制

对代码执行、浏览器、文件和网络工具应采用组合隔离：

- 独立进程或容器，非 root，最小系统调用；
- 只读基础镜像、临时工作目录、磁盘配额；
- CPU、内存、进程数、执行时间限制；
- 默认禁止网络，仅允许目标域名、端口和方法；
- 禁止访问云实例元数据和内部管理网段，防止 SSRF；
- 输入文件做类型、大小和恶意内容扫描；
- 输出经过 DLP 和敏感字段过滤；
- 秘密通过执行环境注入，不进入 Prompt、日志或工具参数。

沙箱降低爆炸半径，但不能替代业务授权。一个被隔离的进程仍可能通过合法 API 越权退款。

## MCP 工具的特殊边界

MCP 标准化客户端与工具/资源/提示服务器的交互，但不自动建立信任。

生产接入时：

1. MCP Server 加入批准清单，记录所有者、来源、版本和数据分类；
2. 工具列表变化需要重新审查，不能动态出现就自动开放；
3. 工具描述和 annotations 视为不可信元数据；
4. 远程 HTTP 使用规范授权，验证 Token audience；
5. 禁止 Token passthrough，下游使用独立凭证；
6. 为工具名冲突建立服务命名空间；
7. 对输入、输出、超时、速率和副作用再次施加本地策略；
8. stdio Server 也要限制进程权限和环境变量。

MCP `2025-11-25` 规范还引入实验性 Tasks。它适合持久请求和延迟取回，但任务 ID 必须绑定授权上下文；无法绑定时要使用高熵 ID、短 TTL，并避免开放任务列表。

## 工具测试与评估

工具测试至少分四层：

| 层 | 验证什么 |
|---|---|
| 契约测试 | Schema、边界值、错误分类、输出兼容 |
| 策略测试 | 不同身份、租户、资源和环境的允许/拒绝 |
| 模型选择测试 | 在相似工具中能否选对，参数是否正确 |
| 故障注入 | 超时、429、部分成功、重复调用、服务重启 |

还要统计：

- 工具选择准确率；
- 参数一次通过率和修复率；
- 无效、重复和越权调用率；
- P50/P95 延迟和失败率；
- 每个成功任务的工具调用数；
- 审批触发、拒绝和误批准率。

## 常见失败设计

### 万能工具

`execute(command: str)` 看似灵活，实际上无法做细粒度授权、评估和解释。优先提供意图级工具。

### 权限写进 Prompt

“不要删除重要文件”只是软提示，不是控制。硬边界必须在工具层。

### 模型持有长期 Token

Token 会进入上下文、Trace 或错误信息。凭证应由网关按调用签发，并受资源、作用域、受众和 TTL 限制。

### 工具返回整库数据

增加成本、污染上下文并扩大泄漏面。使用分页、过滤、聚合和证据引用。

### 把工具元数据当可信

第三方服务器可以在描述中注入指令。描述只用于帮助选择，授权仍由本地策略决定。

## 最佳实践清单

### 必须

- 工具单一职责、严格 Schema、`additionalProperties: false`；
- 身份、租户和凭证由可信运行时注入；
- 每次调用重新鉴权，读写和风险等级分离；
- 写操作有幂等、审批或补偿；
- 原始错误、密钥和敏感数据不返回模型；
- 网络、文件、代码执行使用沙箱与出站限制；
- 第三方 MCP Server 经过来源、版本和权限审查。

### 推荐

- 描述包含使用条件、禁用条件和一个最小示例；
- 输出使用摘要 + 证据引用 + 分页；
- 工具版本化并保持兼容窗口；
- 用真实任务集评估工具选择，而不是只做单元测试；
- 删除低使用率、易混淆或可被更高层工具替代的工具。

## 高频追问

### Q1：工具越多越好吗？

不是。选择空间越大，名称和语义越相似，模型越容易选错，描述也占用更多上下文。按任务动态暴露最小工具集，并持续用选择准确率清理工具。

### Q2：为什么要区分只读和写工具？

它们的风险、审批、重试和幂等语义完全不同。混在一个工具里会迫使系统按最高风险处理，或者错误地放宽写权限。

### Q3：MCP 已经有授权规范，还需要本地策略吗？

需要。协议授权回答客户端是否能访问 Server；本地策略还要判断本次用户、任务、资源和业务条件下是否允许某个动作。认证成功不等于业务授权。

### Q4：如何处理模型参数反复校验失败？

返回字段级、可修复的结构化错误，允许有限次数修正；仍失败就降级到表单、固定工作流或人工输入。不要无限循环。

## 自测

1. 为什么不能让模型传 `tenant_id`？
2. 一个发邮件工具应该怎样分离“保存草稿”和“真正发送”？
3. MCP Server 新增工具后为什么不能立即对所有 Agent 可见？
4. 工具超时但可能已经扣款，下一步是什么？
5. 为什么沙箱不能替代业务权限？

## 与高频题联动

- [AQ03：如何设计一个对 Agent 友好的工具](../agent-development.md#aq03-怎样设计一个对-agent-友好的工具-工具失败如何处理)
- [AQ08：不可信内容影响工具调用时如何防守](../agent-development.md#aq08-如何防御-prompt-injection、工具越权和数据外泄)

## 权威资料

- [Anthropic：Writing effective tools for agents — with agents（2025-09-11）](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [MCP：Tools 规范](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP：Authorization 规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [MCP：Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [MCP：Tasks（实验性）](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks)

---

[上一章：Runtime 与 Harness](./runtime-harness.md) · [返回专题导读](./README.md) · **下一章：** [上下文工程与记忆](./context-memory.md)
