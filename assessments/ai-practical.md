---
title: AI 实操与 AI Coding
description: 用五道原创实操题训练代码审查、提示词改写、事实核验、仓库任务和隐私处理。
---

# 06 AI 实操与 AI Coding

截至 2026 年，HackerRank公开的测评类型已经包括生成式 AI、提示词工程、代码审查、
代码仓库和多类工程实操。德勤当前在线测试也加入了人工智能技术趋势相关的数智认知
内容。这类测评通常观察你能否验证 AI 输出并完成任务，单纯写出一段很长的提示词
并不够。

下面五题均为本站原创。代码统一使用 Python，重点放在需求理解、验证和可解释修改。

## 题目 01 审查 AI 生成代码

AI 生成了下面的高频元素函数。请指出问题并修正。

```python
def top_k_frequent(numbers: list[int], k: int) -> list[int]:
    counts = {}
    for number in numbers:
        counts[number] = counts.get(number, 0) + 1

    return sorted(counts, key=counts.get)[:k]
```

### 答案

主要错误是排序方向。当前代码按频次从小到大取前 `k` 个，得到的是低频元素。
还需要定义非法 `k` 和同频元素的顺序。下面版本规定 `k` 必须位于有效范围内，
同频时数值较小者在前。

```python
def top_k_frequent(numbers: list[int], k: int) -> list[int]:
    counts: dict[int, int] = {}
    for number in numbers:
        counts[number] = counts.get(number, 0) + 1

    if not 1 <= k <= len(counts):
        raise ValueError("k must be between 1 and the number of unique values")

    ordered_numbers = sorted(
        counts,
        key=lambda number: (-counts[number], number),
    )
    return ordered_numbers[:k]
```

### 验证

```python
assert top_k_frequent([1, 1, 2, 2, 2, 3], 2) == [2, 1]
assert top_k_frequent([4, 4, 2, 2], 2) == [2, 4]

try:
    top_k_frequent([1, 2], 0)
except ValueError:
    pass
else:
    raise AssertionError("invalid k should fail")
```

### 审查要点

先核对需求和排序方向，再检查边界、确定性、复杂度和测试。代码能够运行，不代表
它满足任务。

## 题目 02 改写含糊提示词

原提示词如下。

```text
分析最近的销售数据，告诉我哪里有问题，并给一些建议。
```

请把它改成能够稳定交付的分析任务。

### 参考答案

```text
你将收到一张按日期、地区和品类汇总的销售表。

任务
1. 计算最近完整自然周相对前一完整自然周的销售额变化。
2. 找出销售额下降金额最大的三个地区与品类组合。
3. 将变化拆为订单量和客单价两个因素。
4. 数据不足时列出缺失字段，不推测缺失值。

口径
销售额使用 paid_amount。
取消和全额退款订单不计入。
时间使用 Asia/Shanghai。

输出
先给不超过五行的结论，再给计算表和验证步骤。
每条建议必须对应前文的一项数据证据。
```

### 解析

改写后补齐了输入结构、比较窗口、指标口径、异常处理和输出格式。评审时仍要检查
`paid_amount` 是否真实存在，退款口径是否符合业务定义。提示词不能替代数据字典。

### 易错点

堆叠“专业、深入、全面”等形容词，却没有定义时间、指标和输出。

## 题目 03 核验模型给出的事实

模型回答称某软件“最新版本已经默认启用功能 X”。你查到三条材料。

1. 两年前的博客说功能 X 正在测试。
2. 当前官方文档说功能 X 需要手动开启。
3. 一个论坛帖子说安装后自动可用，但没有提供版本号。

你会怎样给出结论？

### 参考答案

当前官方文档与“默认启用”直接冲突，且时间和来源都更可靠。应把结论改为功能 X
目前需要手动开启，并附上官方文档链接与查看日期。论坛帖子缺少版本信息，只能作为
可能存在环境差异的线索。若该事实会影响生产配置，还应在目标版本的隔离环境中实际
验证，并记录命令、版本和结果。

### 解析

事实核验需要比较来源权威性、发布日期、版本适用范围和可重复验证条件。搜索到更多
页面不会自动提高可信度，多条转载也可能来自同一条旧消息。

### 易错点

让同一个模型再次判断自己是否正确，或者按搜索结果数量投票。

## 题目 04 修复仓库中的分页错误

某接口按页返回记录，`fetch_page(page)` 返回当前页列表，空列表表示结束。AI 写出
下面的实现。

```python
def fetch_all(fetch_page):
    page = 1
    records = []

    while True:
        current = fetch_page(page)
        if not current:
            break
        records.extend(current)

    return records
```

请修复并提供最小测试。

### 答案

循环中没有增加页码，会反复请求第一页。修复后每次成功处理一页再递增页码。

```python
from collections.abc import Callable


def fetch_all(fetch_page: Callable[[int], list[int]]) -> list[int]:
    page = 1
    records: list[int] = []

    while True:
        current = fetch_page(page)
        if not current:
            return records

        records.extend(current)
        page += 1
```

```python
def fake_fetch_page(page: int) -> list[int]:
    pages = {
        1: [10, 11],
        2: [12],
        3: [],
    }
    return pages[page]


assert fetch_all(fake_fetch_page) == [10, 11, 12]
```

### 进一步追问

生产代码还要定义请求失败、重试、最大页数、重复记录和游标分页。测评只要求修复
明确错误时，不应擅自重写整个模块，但可以在说明中列出这些边界。

## 题目 05 敏感数据与外部模型

排障日志中含有用户邮箱、访问令牌和内部接口地址。团队希望直接上传到公共 AI 服务，
请它定位错误。你会怎样处理？

### 参考答案

先暂停直接上传，确认公司的数据分类、获批工具和处理规则。提取解决问题所需的最小
日志片段，删除或替换邮箱、令牌、内部地址和其他标识符。令牌一旦可能泄露，应立即
按流程吊销并轮换。若组织提供隔离且获批的模型环境，可以在授权范围内使用，并记录
输入范围和处理目的。无法满足规则时，改用本地工具或人工排查。

### 解析

这道题同时考察任务完成和安全边界。删除姓名通常还不够，令牌、订单号、设备标识和
内部地址也可能造成风险。模型回答质量不能抵消不合规的数据处理。

### 易错点

先上传再删除会留下已经发生的数据暴露。只在提示词末尾要求模型保密，也不能改变
数据已经发送到外部服务的事实。

## AI 实操提交清单

1. 用一句话重述任务的输入、输出和完成条件。
2. 标出 AI 输出中未经验证的假设。
3. 先写最小测试，再修改关键代码。
4. 记录使用了哪些资料、版本和命令。
5. 说明没有处理的边界以及继续处理所需信息。
6. 检查密钥、个人信息、内部地址和受限数据是否进入提交内容。

## 资料依据

- [HackerRank 测评题型](https://support.hackerrank.com/articles/2354192461-question-types-in-hackerrank-tests)
- [德勤招聘流程与数智认知测评](https://www.deloitte.com/cn/zh/careers/explore-your-fit/find-your-possible/our-recruitment-process.html)
- [SHL 编程与工作模拟公开练习](https://www.shlglobal.cn/en/shldirect/en/practice-tests/)
