# 093 · 复原 IP 地址

<ProblemMeta
  :tags="['DFS', '华为面试题', '回溯']"
  difficulty="medium"
  :appearances="12"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/restore-ip-addresses/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(3⁴)" space="O(4)" />

## 题目

给定一个只包含数字的字符串 `s`，在不改变字符顺序、不删除字符的前提下插入三个点，返回所有可能的有效 IPv4 地址。

每个地址必须恰好包含四段，每段取值为 `0` 到 `255`，且多位数字不能以 `0` 开头。

### 示例

```text
输入：s = "25525511135"
输出：["255.255.11.135", "255.255.111.35"]
```

```text
输入：s = "0000"
输出：["0.0.0.0"]
```

## 回溯状态

用 `start` 表示下一个未处理字符的位置，`segments` 保存已经切出的网段。

每次尝试截取 1、2、3 位：

- 长度大于 1 且以 `0` 开头时停止；
- 数值大于 `255` 时停止；
- 剩余字符数不足以填满网段，或多于每段 3 位的容量时剪枝。

## Python 实现

```python
class Solution:
    def restoreIpAddresses(self, s: str) -> list[str]:
        if not 4 <= len(s) <= 12:
            return []

        answer: list[str] = []
        segments: list[str] = []

        def backtrack(start: int) -> None:
            remaining_characters = len(s) - start
            remaining_segments = 4 - len(segments)

            # 剩余字符数必须能被剩余段数消耗，否则立即剪枝。
            if not (
                remaining_segments
                <= remaining_characters
                <= remaining_segments * 3
            ):
                return

            if len(segments) == 4:
                if start == len(s):
                    answer.append(".".join(segments))
                return

            for length in range(1, 4):
                end = start + length
                if end > len(s):
                    break
                if length > 1 and s[start] == "0":
                    break

                segment = s[start:end]
                if int(segment) > 255:
                    break

                segments.append(segment)
                backtrack(end)
                segments.pop()

        backtrack(0)
        return answer
```

## 剪枝为什么安全

假设还需要切 `k` 段，每段至少 1 位、至多 3 位，那么剩余字符数必须位于 `[k, 3k]`。超出这个范围时，无论如何切分都不可能完成有效地址，可以立即返回。

长度递增时，一旦出现前导零或数值超过 `255`，更长的切片也一定无效，所以使用 `break`。

## 正确性说明

算法对每个网段枚举所有可能的 1 到 3 位切法，只保留无前导零且数值不超过 `255` 的网段。恰好切出四段并消费全部字符时记录答案，因此每个结果都有效。任意有效 IP 的四个切分长度都在搜索范围内，且不会被合法性与容量剪枝排除，所以不会漏解。

## 复杂度

- 时间复杂度：`O(3⁴)`，IPv4 固定只有四段，每层至多三种长度，实际是常数级。
- 空间复杂度：`O(4)`，不计输出时路径和递归深度最多为四。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `"0000"` | `["0.0.0.0"]` | 前导零 |
| `"1111"` | `["1.1.1.1"]` | 最短长度 |
| `"25525511135"` | 2 个结果 | 上界 `255` |
| `"123"` | `[]` | 字符不足 |
| 13 位数字 | `[]` | 字符过多 |

## 90 秒面试表达

“这题是固定四层的切割回溯。每层从当前位置截取 1 到 3 位，排除多位前导零和大于 255 的网段。状态包括当前下标和已切出的段；四段且刚好用完整个字符串时记录。再根据剩余 `k` 段需要至少 `k`、至多 `3k` 个字符做容量剪枝。搜索上界是 `3^4`，递归空间也是常数。”

## 常见追问

- IPv6 的规则不同，通常按固定组数与十六进制字符重新建模。
- 如果只求数量，可以返回递归计数，不保存路径字符串。
- 切割回溯的通用状态是“起点 + 已选片段”，常见于分割回文串等题目。
