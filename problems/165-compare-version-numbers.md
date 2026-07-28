# 165 · 比较版本号

<ProblemMeta
  :tags="['字节面试题', '模拟', '字符串']"
  difficulty="medium"
  :appearances="13"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/compare-version-numbers/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(m + n)" space="O(1)" />

## 题目

给定两个由点号分隔的版本字符串 `version1` 和 `version2`，逐段比较它们的修订号：

- `version1 > version2`，返回 `1`；
- `version1 < version2`，返回 `-1`；
- 两者相等，返回 `0`。

比较修订号时忽略前导零；缺失的修订号按 `0` 处理。

### 示例

```text
输入：version1 = "1.01", version2 = "1.001"
输出：0
```

```text
输入：version1 = "1.0", version2 = "1.0.0"
输出：0
```

```text
输入：version1 = "0.1", version2 = "1.1"
输出：-1
```

### 约束观察

- 版本号不是小数，`1.10` 应按修订号 `10` 比较。
- 每一段独立比较，第一处不同就能决定结果。
- 末尾缺失段视为零，所以 `1.0` 与 `1.0.0` 相等。

## 直接方案

可以使用 `split(".")` 拆分两个字符串，把对应片段转为整数后比较。这个方案清晰，但会创建两个片段列表和多个子字符串，额外空间为 `O(m + n)`。

如果希望只使用常数额外空间，可以用两个指针直接解析每个修订号。

## 优化抓手

从当前位置开始逐位读取数字：

```text
revision = revision × 10 + 当前数字
```

读到点号或字符串末尾时得到一个完整修订号。比较两个修订号后继续处理下一段；当某个字符串已经结束时，它之后的修订号自然按 `0` 处理。

## Python 实现

```python
class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        first_index = 0
        second_index = 0

        # 逐段解析为整数，自动忽略前导零和末尾缺失的零段。
        while (
            first_index < len(version1)
            or second_index < len(version2)
        ):
            first_revision, first_index = self._read_revision(
                version1,
                first_index,
            )
            second_revision, second_index = self._read_revision(
                version2,
                second_index,
            )

            if first_revision < second_revision:
                return -1
            if first_revision > second_revision:
                return 1

        return 0

    def _read_revision(
        self,
        version: str,
        index: int,
    ) -> tuple[int, int]:
        revision = 0

        while index < len(version) and version[index] != ".":
            revision = revision * 10 + ord(version[index]) - ord("0")
            index += 1

        if index < len(version):
            index += 1

        return revision, index
```

## 为什么前导零自动被忽略

逐位计算时：

```text
"001" → ((0 × 10 + 0) × 10 + 0) × 10 + 1 = 1
```

前导零不会改变修订号数值，因此不需要单独删除。

## 为什么缺失段能按零处理

当一个版本已经读完、另一个版本仍有内容时，`_read_revision` 对已结束字符串返回 `0`。这样 `1.0` 会继续与 `1.0.0` 的最后一个 `0` 比较，最终判定相等。

## 正确性说明

版本比较由从左到右第一对不同修订号决定。算法依次解析并比较同位置修订号，忽略前导零且把缺失段视为零，与题目规则一致。如果某段不同立即返回；如果所有可见和补零后的修订号都相同，则两个版本相等。

## 复杂度

- 时间复杂度：`O(m + n)`。两个字符串的每个字符只读取一次。
- 空间复杂度：`O(1)`。不创建修订号列表。

## 边界用例

| `version1` | `version2` | 预期 | 检查点 |
|---|---|---:|---|
| `"1.01"` | `"1.001"` | 0 | 前导零 |
| `"1.0"` | `"1.0.0"` | 0 | 缺失段补零 |
| `"0.1"` | `"1.1"` | -1 | 首段不同 |
| `"1.10"` | `"1.2"` | 1 | 不是小数比较 |
| `"7.5.2.4"` | `"7.5.3"` | -1 | 中间段不同 |

## 90 秒面试表达

“版本号要按点号分隔的修订号逐段比较，不是按字符串或小数比较。`split` 很直接，但会使用线性额外空间。我用两个指针逐位解析修订号，遇到点号就比较；前导零在数值累积时会自然忽略，某个版本提前结束后，后续修订号按零处理。第一处不同立即返回，否则最终相等。时间 `O(m + n)`、额外空间 `O(1)`。”

## 常见追问

- 如果修订号可能长到无法放入定长整数，可以去掉前导零后按长度和字典序比较。
- 如果允许字母预发布标识，需要先明确是否遵循 Semantic Versioning。
- 如果输入可能包含连续点号或非法字符，需要增加格式校验。
