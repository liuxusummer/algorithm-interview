# 1190 · 反转每对括号间的子串

<ProblemMeta
  :tags="['华为面试题', '栈与队列', '栈']"
  difficulty="medium"
  :appearances="4"
  pass-rate="60%"
  source-url="https://leetcode.cn/problems/reverse-substrings-between-each-pair-of-parentheses/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定括号平衡的字符串，从内到外反转每一对括号中的内容，最终返回删除所有括号后的字符串。

### 示例

```text
输入：s = "(u(love)i)"
输出："iloveu"
解释：先反转 "love" 得到 "evol"，再反转外层内容得到 "iloveu"。
```

### 约束观察

- 输入括号保证配对，可以安全使用栈建立映射；
- 括号只控制方向，不会出现在最终答案中；
- 直接对每层子串切片反转，深层嵌套时会重复处理字符。

## 先说栈内反转

遇到右括号时，可以弹出栈中直到左括号的字符并逆序放回。写法直观，但字符可能在多层括号中被重复移动，最坏会达到 `O(n²)`。

## 括号跳转法

先用栈记录每对括号的匹配位置。第二次扫描时，遇到括号就跳到与它匹配的位置，并反转行进方向；普通字符直接加入结果。这样每个位置只访问一次。

## Python 实现

```python
class Solution:
    def reverseParentheses(self, s: str) -> str:
        pair = {}
        stack = []

        for index, char in enumerate(s):
            if char == "(":
                stack.append(index)
            elif char == ")":
                left = stack.pop()
                pair[left] = index
                pair[index] = left

        answer = []
        index, direction = 0, 1
        while 0 <= index < len(s):
            if s[index] in "()":
                # 跳到配对括号，并改变后续遍历方向
                index = pair[index]
                direction = -direction
            else:
                answer.append(s[index])
            index += direction

        return "".join(answer)
```

## 正确性说明

跨过一对括号时改变方向，等价于反向读取括号内内容；嵌套括号会再次改变方向，恰好模拟从内到外的连续反转。括号本身不加入结果，因此最终字符串符合要求。

### `(u(love)i)` 的行进轨迹

```text
从左括号跳到最右括号并改为向左
依次读出 i
遇到内层右括号，跳到对应左括号并改为向右
依次读出 love
遇到外层左括号，跳到对应右括号并改为向左
最后读出 u
```

每次跳转都会改变方向，正好抵消嵌套层级带来的反转。

## 复杂度

- 时间：`O(n)`
- 空间：`O(n)`

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| `"abc"` | `"abc"` | 没有括号 |
| `"(abc)"` | `"cba"` | 单层反转 |
| `"(ed(et(oc))el)"` | `"leetcode"` | 多层嵌套 |
| `"a(bcdefghijkl(mno)p)q"` | `"apmnolkjihgfedcbq"` | 普通字符与嵌套混合 |

## 90 秒面试表达

直接逐层切片反转可能重复搬运字符。我先用栈记录每对括号的匹配下标，然后从左向右走：遇到普通字符就加入答案；遇到括号就跳到配对位置，并把方向乘以 `-1`。每个位置只访问一次，括号不输出，因此时间和空间都是 `O(n)`。

## 常见追问

- 逐层切片反转更直观，但深度嵌套时可能退化到 `O(n²)`；
- 如果括号不保证合法，需要在建立映射时检测空栈和剩余左括号；
- 跳转后仍要按新方向移动一步，否则会反复停在同一个括号上。
