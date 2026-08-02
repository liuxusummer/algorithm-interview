# 079 · 单词搜索

<ProblemMeta
  :tags="['Hot100', '大厂面试', '回溯']"
  difficulty="medium"
  :appearances="11"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/word-search/"
  source-label="力扣原题"
/>

<ComplexityBadge
  time="O(mn · 3ᴸ)"
  space="used 版 O(mn + L)，原地版 O(L)"
/>

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

匹配当前字符后，需要把格子标记为“当前路径已使用”，再搜索四个方向；无论成功还是失败，返回前都要撤销标记。

标记方式有两种：

- 使用独立的 `used` 布尔矩阵，不修改输入，逻辑更加直观；
- 临时修改 `board`，回溯时恢复，可以省去 `O(mn)` 的访问数组。

## 剪枝

- 网格中某个字符的总数少于单词需求时，直接失败。
- 从网格中出现更少的端点字符开始搜索，通常分支更少。因此如果首字符比尾字符更常见，就反转 `word`。
- 从当前格子进入下一层后，最多只有三个方向可走，因为刚来的格子已被标记。

## 动画拆解

下面在网格中标出当前递归位置、已选择路径和失败方向。最后一步会恢复所有临时标记，直观看到“做选择—递归—撤销选择”的完整闭环。

<GridSearchDemo variant="word-search" />

## 解法一：`used` 布尔矩阵 + 共享结果

下面是题目所给 Java 思路的 Python 写法。`found` 相当于 Java 成员变量 `ans`，用于在任意一条路径匹配成功后通知所有递归层提前停止。

```python
class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows = len(board)
        columns = len(board[0])

        # used 只表示“当前递归路径是否使用过该格子”。
        # 不同起点、不同搜索分支之间仍然可以使用同一个格子。
        used = [
            [False] * columns
            for _ in range(rows)
        ]
        found = False

        def dfs(row: int, column: int, index: int) -> None:
            nonlocal found

            # 其他搜索分支已经找到答案，无需继续展开。
            if found:
                return

            # 越界，或者当前格子已在本次路径中使用，都不能继续。
            if not (0 <= row < rows and 0 <= column < columns):
                return
            if used[row][column]:
                return

            # 当前格子的字符必须与 word[index] 相同。
            if board[row][column] != word[index]:
                return

            # 最后一个字符也匹配成功，整条单词路径已经找到。
            # 这里直接返回，不能再用 index + 1 访问 word。
            if index == len(word) - 1:
                found = True
                return

            # 做选择：当前格子在这条路径中暂时不可再次使用。
            used[row][column] = True

            dfs(row + 1, column, index + 1)
            dfs(row - 1, column, index + 1)
            dfs(row, column + 1, index + 1)
            dfs(row, column - 1, index + 1)

            # 撤销选择：返回上一层前恢复现场，供其他路径使用。
            used[row][column] = False

        for row in range(rows):
            for column in range(columns):
                # 只有首字符相同的格子才可能成为搜索起点。
                if board[row][column] == word[0]:
                    dfs(row, column, 0)

                if found:
                    return True

        return False
```

### 为什么 `found` 要使用 `nonlocal`

`found` 定义在 `exist()` 内部，而赋值发生在嵌套函数 `dfs()` 中。使用 `nonlocal found` 后，所有递归调用操作的都是同一个结果变量；任意分支成功，其余递归层都能通过 `if found` 立即停止。

访问数组不能定义成全局永久状态。某个格子只是不允许在同一条路径中重复使用，回溯后必须恢复为 `False`。

## 解法二：原地标记 + 频次剪枝

如果允许在搜索过程中临时修改 `board`，可以直接把当前格子改成特殊字符，递归返回时再恢复。这样不再需要 `used` 矩阵，同时可以加入字符频次和稀缺端点剪枝。

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

        # 先按字符数量剪枝，并从棋盘中更稀缺的一端开始搜索。
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
            # 临时标记为已访问，回溯时恢复现场。
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

格子只能在当前搜索路径中使用一次，但可以被其他起点或其他分支使用。无论使用 `used` 矩阵还是原地修改，标记都是路径级状态，递归返回时必须恢复，否则会错误地阻止后续分支访问该格子。

成功提前返回前也要恢复，避免函数对输入留下难以察觉的修改。

## 正确性说明

算法从每个可能的起点出发，递归只进入与单词下一字符相同的上下左右邻格。当前路径访问过的格子会被标记，因此不会重复使用。所有合法路径的每一步都在四个搜索方向中，算法不会漏掉；只有完整匹配到最后一个字符时才返回成功，因此不会产生误判。

## 复杂度

- 两种解法的时间复杂度最坏均为 `O(mn · 3ᴸ)`，`L` 为单词长度；首步后通常最多向三个未访问方向扩展；
- `used` 版本需要 `O(mn)` 访问数组和 `O(L)` 递归栈，总空间为 `O(mn + L)`；
- 原地标记版本不需要访问数组，额外空间为 `O(L)`；频次表受字符集大小限制。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 单格 `"A"`，搜索 `"A"` | `True` | 最短匹配 |
| 单格 `"A"`，搜索 `"AA"` | `False` | 格子不可复用 |
| 示例网格，搜索 `"SEE"` | `True` | 多起点 |
| 示例网格，搜索 `"ABCB"` | `False` | 回溯恢复 |

## 90 秒面试表达

“我从每个格子尝试回溯，状态是当前位置和待匹配字符下标。字符不匹配立即返回；匹配后把当前格标记为已访问，搜索四邻，再恢复现场。为了不修改输入，可以使用 `used` 矩阵；如果追求更低空间，可以原地标记并在回溯时恢复，再配合字符频次和稀缺端点剪枝。最坏时间 `O(mn·3^L)`，原地版递归空间 `O(L)`。”

## 常见追问

- 多个单词同时搜索时，应把单词建成 Trie，共享前缀搜索。
- 如果不允许修改输入，使用解法一的 `used` 布尔矩阵。
- 更激进的剪枝可以预先检查相邻字符对是否可能出现。
