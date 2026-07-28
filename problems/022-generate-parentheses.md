# 022 · 括号生成

<ProblemMeta
  :tags="['Hot100', '大厂面试', '回溯']"
  difficulty="medium"
  :appearances="11"
  pass-rate="63%"
  source-url="https://leetcode.cn/problems/generate-parentheses/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(Cₙ · n)" space="O(n)" />

## 题目

给定括号对数 `n`，生成所有由 `n` 个左括号和 `n` 个右括号组成的有效括号字符串。

有效意味着任意前缀中的右括号数量都不超过左括号数量，并且最终两者数量相等。

### 示例

```text
输入：n = 3
输出：["((()))", "(()())", "(())()", "()(())", "()()()"]
```

## 暴力方案

枚举长度为 `2n` 的全部括号字符串，共有 `2^(2n)` 种，再逐一检查是否合法。

大量前缀已经不合法的字符串仍会被继续生成，浪费了搜索。

## 回溯约束

构造过程中维护两个计数：

- `opened < n` 时可以放左括号；
- `closed < opened` 时才可以放右括号。

第二条约束保证搜索树上的每个前缀始终合法，因此不需要在叶子结点重新检查。

## Python 实现

```python
class Solution:
    def generateParenthesis(self, n: int) -> list[str]:
        answer: list[str] = []
        path: list[str] = []

        def backtrack(opened: int, closed: int) -> None:
            if len(path) == 2 * n:
                answer.append("".join(path))
                return

            # 左括号不能超量；右括号只能闭合一个已经存在的左括号。
            if opened < n:
                path.append("(")
                backtrack(opened + 1, closed)
                path.pop()

            if closed < opened:
                path.append(")")
                backtrack(opened, closed + 1)
                path.pop()

        backtrack(0, 0)
        return answer
```

## 正确性说明

算法只在左括号还有剩余时添加左括号，只在已有未匹配左括号时添加右括号，所以生成过程中的任意前缀都合法。长度达到 `2n` 时，左右括号必然各有 `n` 个，因此得到有效字符串。反过来，任意有效字符串的每一步选择都满足这两个条件，算法一定能沿对应分支生成它，所以不会漏解。

## 复杂度

- 时间复杂度：`O(Cₙ · n)`，`Cₙ` 是第 `n` 个卡特兰数，复制每个答案需要 `O(n)`。
- 空间复杂度：`O(n)`，不计结果集时为递归栈与路径长度。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `n = 1` | `["()"]` | 最小输入 |
| `n = 2` | `["(())", "()()"]` | 两种结构 |
| `n = 3` | 5 个答案 | 卡特兰数 |

## 90 秒面试表达

“暴力生成所有长度为 `2n` 的字符串会包含大量非法前缀。我用回溯直接维护合法性：左括号使用数小于 `n` 时可以继续放左括号；右括号使用数必须小于左括号使用数，才能放右括号。路径长度到 `2n` 时就是一个完整答案。这样搜索树里没有非法状态，时间与有效答案数量同阶，为 `O(Cₙ·n)`，递归空间 `O(n)`。”

## 常见追问

- 如果只求方案数量，可以使用卡特兰数公式或动态规划。
- 若括号有多种类型，需要额外维护栈，确保闭括号匹配最近的开括号。
- 回溯题的核心不是“递归”，而是定义选择、约束、撤销和结束条件。
