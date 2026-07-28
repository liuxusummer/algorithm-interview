# 076 · 最小覆盖子串

<ProblemMeta
  :tags="['Hot100', '大厂面试', '滑动窗口']"
  difficulty="hard"
  :appearances="10"
  pass-rate="41%"
  source-url="https://leetcode.cn/problems/minimum-window-substring/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(|S| + |T|)" space="O(|T|)" />

## 题目

给定两个字符串 `s` 和 `t`，返回 `s` 中涵盖 `t` 所有字符的最短连续子串。

字符出现次数也必须满足要求。例如 `t = "AABC"` 时，窗口中必须至少包含两个 `A`、一个 `B` 和一个 `C`。如果不存在满足条件的窗口，返回空字符串。

### 示例

```text
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
```

```text
输入：s = "a", t = "aa"
输出：""
```

### 约束观察

- 题目要求连续子串，适合滑动窗口。
- 不是判断字符种类是否出现，而是要满足每种字符的数量。
- 窗口未覆盖 `t` 时只能扩大；覆盖后应尽可能收缩。

## 先说暴力解

枚举 `s` 的所有子串，再统计每个子串的字符频次，判断能否覆盖 `t`。

子串数量为 `O(|S|²)`，如果每次重新统计字符，最坏时间复杂度达到 `O(|S|³)`。

## 优化抓手

使用两个频次表：

- `required_frequency`：目标字符串需要的字符数量；
- `window_frequency`：当前窗口内相关字符的数量。

再维护 `satisfied_types`，表示当前有多少种字符已经达到目标数量。当它等于目标字符种类数时，窗口有效，可以移动左边界寻找更短答案。

## Python 实现

```python
from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or len(t) > len(s):
            return ""

        required_frequency = Counter(t)
        window_frequency: dict[str, int] = {}
        required_types = len(required_frequency)
        satisfied_types = 0

        left = 0
        best_start = 0
        best_length = len(s) + 1

        # 扩张右边界直到覆盖 t，再收缩左边界寻找最短窗口。
        for right, char in enumerate(s):
            if char in required_frequency:
                window_frequency[char] = window_frequency.get(char, 0) + 1

                if window_frequency[char] == required_frequency[char]:
                    satisfied_types += 1

            while satisfied_types == required_types:
                current_length = right - left + 1
                if current_length < best_length:
                    best_start = left
                    best_length = current_length

                left_char = s[left]
                if left_char in required_frequency:
                    window_frequency[left_char] -= 1

                    if (
                        window_frequency[left_char]
                        < required_frequency[left_char]
                    ):
                        satisfied_types -= 1

                left += 1

        if best_length == len(s) + 1:
            return ""
        return s[best_start:best_start + best_length]
```

## 为什么比较的是字符种类

只有当某种字符的窗口频次第一次达到目标频次时，`satisfied_types` 才加一；收缩时，只有从“满足”变成“不满足”才减一。

这样不会因为窗口中出现多余字符而反复修改状态。例如目标需要一个 `A`，窗口中第二个、第三个 `A` 都不会增加已满足种类数。

## 为什么收缩前先记录答案

进入 `while` 循环说明当前窗口已经有效。先记录长度，再移除左字符；如果移除后窗口失效，本轮以当前右边界结尾的最短合法窗口就是移除前的状态。

## 正确性说明

右边界逐个加入字符，直到窗口覆盖 `t` 的全部频次。窗口有效时，算法持续移动左边界，依次检查所有以当前右边界结尾的合法窗口，直到再收缩就会失效。因此每个右边界对应的最短合法窗口都会被比较，全局最短窗口不会被遗漏。

## 复杂度

- 时间复杂度：`O(|S| + |T|)`。每个字符最多被左右边界各处理一次。
- 空间复杂度：`O(|T|)`。只保存目标字符的频次。

## 边界用例

| `s` | `t` | 预期 | 检查点 |
|---|---|---|---|
| `"ADOBECODEBANC"` | `"ABC"` | `"BANC"` | 基础路径 |
| `"a"` | `"a"` | `"a"` | 单字符 |
| `"a"` | `"aa"` | `""` | 数量不足 |
| `"aa"` | `"aa"` | `"aa"` | 重复字符 |
| `"ab"` | `"b"` | `"b"` | 收缩到单字符 |

## 90 秒面试表达

“暴力枚举所有子串并统计频次最坏是立方级。我用滑动窗口维护目标字符在当前窗口中的频次，并用 `satisfied_types` 记录已有多少种字符达到所需数量。窗口未覆盖目标时扩大右边界；全部满足后持续收缩左边界，并在每次收缩前更新最短答案。只有某种字符从未满足变为满足或反向变化时才更新计数。左右边界都只向前移动，时间 `O(|S| + |T|)`，空间 `O(|T|)`。”

## 常见追问

- 如果只需要判断是否存在覆盖窗口，找到第一个合法窗口即可返回。
- 如果要求所有最短窗口，可以记录最短长度并保存所有同长度区间。
- 如果字符集固定为 ASCII，可以用定长数组代替哈希表。
