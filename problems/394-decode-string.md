# 394 · 字符串解码

<ProblemMeta
  :tags="['Hot100', '大厂面试', '栈', '华为面试题']"
  difficulty="medium"
  :appearances="25"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/decode-string/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n + L)" space="O(n + L)" />

## 题目

给定编码字符串 `s`，规则 `k[encoded_string]` 表示方括号内的字符串重复 `k` 次。编码可以嵌套，返回完整解码结果。

`k` 是正整数，输入保证格式合法，原始字母串中不含数字。

### 示例

```text
输入：s = "3[a]2[bc]"
输出："aaabcbc"

输入：s = "3[a2[c]]"
输出："accaccacc"

输入：s = "2[abc]3[cd]ef"
输出："abcabccdcdcdef"
```

## 栈帧保存什么

扫描字符串时维护：

- `repeat`：当前读取的多位重复次数；
- `current`：当前层已经解码的字符；
- `stack`：遇到 `[` 时保存外层的 `(前缀, 重复次数)`。

遇到 `]` 时，当前层结束，弹出外层栈帧并组合：

```text
外层前缀 + 当前层字符串 × 重复次数
```

## Python 实现

```python
class Solution:
    def decodeString(self, s: str) -> str:
        stack: list[tuple[str, int]] = []
        current: list[str] = []
        repeat = 0

        # 栈保存进入当前方括号前的前缀和重复次数。
        for char in s:
            if char.isdigit():
                repeat = repeat * 10 + int(char)
            elif char == "[":
                stack.append(("".join(current), repeat))
                current = []
                repeat = 0
            elif char == "]":
                prefix, times = stack.pop()
                current = [prefix + "".join(current) * times]
            else:
                current.append(char)

        return "".join(current)
```

## 为什么 `repeat` 要乘 10

重复次数可能是多位数。连续读取 `"12"` 时需要得到：

```text
0 → 1 → 1 × 10 + 2 = 12
```

进入 `[` 后，这个数字只属于当前层，要与外层前缀一起入栈，并把 `repeat` 重置为零。

## 正确性说明

栈中的每一帧准确保存尚未闭合层的外部前缀和重复次数。普通字符被追加到当前层；遇到 `]` 时，当前层已完整解码，将它重复指定次数并接回外层前缀，得到上一层截至当前位置的正确解码结果。嵌套括号按后进先出的顺序闭合，与栈顺序完全一致，因此最终字符串正确。

## 复杂度

- 时间复杂度：`O(n + L)`，`n` 是编码长度，`L` 是解码结果长度；输出本身就需要 `O(L)`。
- 空间复杂度：`O(n + L)`，栈深度受输入限制，构造结果需要与输出规模同阶的字符空间。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `"3[a]"` | `"aaa"` | 单层 |
| `"10[a]"` | 10 个 `"a"` | 多位数字 |
| `"3[a2[c]]"` | `"accaccacc"` | 嵌套 |
| `"abc"` | `"abc"` | 没有编码 |
| `"2[ab]c"` | `"ababc"` | 外层普通字符 |

## 90 秒面试表达

“嵌套结构按后进先出闭合，所以用栈保存每层的外部前缀和重复次数。数字通过 `repeat = repeat*10 + digit` 解析；遇到左括号就把当前前缀和次数入栈并开启新层；遇到右括号就弹出栈帧，把当前层重复后接回前缀。时间至少与输入和输出长度同阶，为 `O(n+L)`。”

## 常见追问

- 可以用递归下降解析，让函数在遇到 `]` 时返回当前层结果。
- 超大重复次数可能使输出爆炸，工程中应设置输出长度上限。
- 若需要流式输出，不能简单一次性物化完整字符串，需要设计迭代器或分块生成。
