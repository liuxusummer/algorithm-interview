# 139 · 单词拆分

<ProblemMeta
  :tags="['Hot100', '大厂面试', '动态规划']"
  difficulty="medium"
  :appearances="15"
  pass-rate="51%"
  source-url="https://leetcode.cn/problems/word-break/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n · L²)" space="O(n)" />

## 题目

给定字符串 `s` 和单词字典 `wordDict`，判断能否用字典中的一个或多个单词拼接出整个字符串。

字典中的单词可以重复使用。

### 示例

```text
输入：s = "leetcode", wordDict = ["leet", "code"]
输出：True

输入：s = "catsandog",
     wordDict = ["cats", "dog", "sand", "and", "cat"]
输出：False
```

## 状态与转移

定义：

```text
reachable[end] = s[:end] 是否能够被字典单词完整拆分
```

空前缀天然可达，所以 `reachable[0] = True`。

若存在切分点 `start`，使得前缀 `s[:start]` 可达，并且 `s[start:end]` 在字典中，那么 `reachable[end] = True`。

## Python 实现

```python
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        maximum_word_length = max(map(len, words))
        reachable = [False] * (len(s) + 1)
        reachable[0] = True

        for end in range(1, len(s) + 1):
            for length in range(
                1,
                min(maximum_word_length, end) + 1,
            ):
                start = end - length

                if reachable[start] and s[start:end] in words:
                    reachable[end] = True
                    break

        return reachable[-1]
```

## 剪枝在哪里

- 字典转成集合，使单词查询平均为 `O(1)`；
- 只枚举不超过最长字典单词的后缀；
- 找到一个可行切分点后立即结束当前状态。

注意必须先检查 `reachable[start]`。即使后缀在字典中，前面的字符串无法拆分，也不能使当前前缀可达。

## 正确性说明

若算法把 `reachable[end]` 设为真，则存在可达前缀 `s[:start]` 和一个字典单词 `s[start:end]`，拼接后得到合法的 `s[:end]`。反过来，任意合法拆分的最后一个单词必然对应某个切分点 `start`，此前前缀也合法；算法会枚举该单词长度并发现这一转移。因此每个状态真假与定义一致，最终状态准确表示整个字符串能否拆分。

## 复杂度

设 `n = len(s)`，`L` 为最长字典单词长度。

- 时间复杂度：Python 切片需要复制字符，最坏为 `O(n · L²)`。
- 空间复杂度：`O(n)`，不计字典集合本身。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| `"leetcode"`, `["leet","code"]` | `True` | 基础切分 |
| `"applepenapple"`, `["apple","pen"]` | `True` | 单词可复用 |
| `"catsandog"`, 常见字典 | `False` | 局部可切但整体不可切 |
| 字典含整个 `s` | `True` | 单段完成 |

## 90 秒面试表达

“定义 `reachable[end]` 表示前 `end` 个字符能否被完整拆分，空前缀为真。对每个结束位置枚举最后一个单词长度，如果此前前缀可达且当前后缀在字典集合中，就把状态设为真。最长单词长度可以限制枚举范围。Python 切片计入成本时最坏 `O(n·L²)`，DP 空间 `O(n)`。”

## 常见追问

- 要返回一种拆分方案，可以记录每个可达状态的前驱切分点。
- 要返回所有拆分句子，需要 DFS + 记忆化，并注意答案数量可能指数级。
- 字典很大且共享前缀多时，可以使用 Trie 从每个可达位置向后扫描。
