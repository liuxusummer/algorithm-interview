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

## 思路

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

## 复杂度

- 时间：`O(n)`
- 空间：`O(n)`

## 常见追问

逐层切片反转更直观，但深度嵌套时可能退化到 `O(n²)`；括号跳转法保持线性复杂度。
