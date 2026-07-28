# 079 · 单词搜索

<ProblemMeta
  :tags="['Hot100', '大厂面试', '回溯']"
  difficulty="medium"
  :appearances="11"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/word-search/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn · 3ᴸ)" space="O(L)" />

## 题目

给定 `m × n` 的字符网格 `board` 和字符串 `word`，判断能否从某个格子出发，通过上下左右相邻的格子依次拼出 `word`。

同一个格子在一条搜索路径中不能重复使用。

### 示例

```text
输入：
board = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"]
]
word = "ABCCED"
输出：True
```

## 搜索状态

`dfs(row, column, index)` 表示当前位于 `(row, column)`，并准备匹配 `word[index]`。

匹配当前字符后，临时把格子改为特殊标记，再搜索四个方向；无论成功还是失败，返回前都恢复原字符。

## 剪枝

- 网格中某个字符的总数少于单词需求时，直接失败。
- 从网格中出现更少的端点字符开始搜索，通常分支更少。因此如果首字符比尾字符更常见，就反转 `word`。
- 从当前格子进入下一层后，最多只有三个方向可走，因为刚来的格子已被标记。

## Python 实现

```python
from collections import Counter


class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows = len(board)
        columns = len(board[0])

        board_frequency = Counter(
            board[row][column]
            for row in range(rows)
            for column in range(columns)
        )
        word_frequency = Counter(word)

        if any(
            board_frequency[char] < needed
            for char, needed in word_frequency.items()
        ):
            return False

        if board_frequency[word[0]] > board_frequency[word[-1]]:
            word = word[::-1]

        def dfs(row: int, column: int, index: int) -> bool:
            if board[row][column] != word[index]:
                return False
            if index == len(word) - 1:
                return True

            saved = board[row][column]
            board[row][column] = "#"

            for row_step, column_step in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                next_row = row + row_step
                next_column = column + column_step

                if (
                    0 <= next_row < rows
                    and 0 <= next_column < columns
                    and dfs(next_row, next_column, index + 1)
                ):
                    board[row][column] = saved
                    return True

            board[row][column] = saved
            return False

        for row in range(rows):
            for column in range(columns):
                if dfs(row, column, 0):
                    return True

        return False
```

## 为什么必须恢复现场

格子只能在当前搜索路径中使用一次，但可以被其他起点或其他分支使用。标记是路径级状态，递归返回时必须恢复，否则会错误地阻止后续分支访问该格子。

成功提前返回前也要恢复，避免函数对输入留下难以察觉的修改。

## 正确性说明

算法从每个可能的起点出发，递归只进入与单词下一字符相同的上下左右邻格。当前路径访问过的格子会被标记，因此不会重复使用。所有合法路径的每一步都在四个搜索方向中，算法不会漏掉；只有完整匹配到最后一个字符时才返回成功，因此不会产生误判。

## 复杂度

- 时间复杂度：最坏 `O(mn · 3ᴸ)`，`L` 为单词长度；首步后通常最多向三个未访问方向扩展。
- 空间复杂度：`O(L)`，递归深度最多为单词长度；频次表受字符集大小限制。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 单格 `"A"`，搜索 `"A"` | `True` | 最短匹配 |
| 单格 `"A"`，搜索 `"AA"` | `False` | 格子不可复用 |
| 示例网格，搜索 `"SEE"` | `True` | 多起点 |
| 示例网格，搜索 `"ABCB"` | `False` | 回溯恢复 |

## 90 秒面试表达

“我从每个格子尝试回溯，状态是当前位置和待匹配字符下标。字符不匹配立即返回；匹配后把当前格临时标记为已访问，搜索四邻，再恢复现场。先用频次表排除字符数量不足的情况，还可以从出现更少的单词端点开始以减少分支。最坏时间 `O(mn·3^L)`，递归空间 `O(L)`。”

## 常见追问

- 多个单词同时搜索时，应把单词建成 Trie，共享前缀搜索。
- 如果不允许修改输入，可以使用 `visited` 布尔矩阵。
- 更激进的剪枝可以预先检查相邻字符对是否可能出现。
