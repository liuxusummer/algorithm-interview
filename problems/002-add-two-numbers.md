# 002 · 两数相加

<ProblemMeta
  :tags="['Hot100', '大厂面试', '链表']"
  difficulty="medium"
  :appearances="20"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/add-two-numbers/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(max(m, n))" space="O(max(m, n))" />

## 题目

两个非空链表分别表示两个非负整数。数字按逆序存储，每个结点保存一位数字。返回表示两数之和的新链表，结果也按逆序存储。

除数字 `0` 外，输入不会以无效的高位零结尾。

### 示例

```text
输入：l1 = 2 → 4 → 3，l2 = 5 → 6 → 4
输出：7 → 0 → 8
解释：342 + 465 = 807
```

### 核心思路

链表头就是最低位，可以直接同步向后模拟竖式加法。每轮计算两个当前数字与进位：

```text
total = first_digit + second_digit + carry
result_digit = total % 10
carry = total // 10
```

用虚拟头结点简化结果链表的首次插入。

## Python 实现

```python
from typing import Optional


class Solution:
    def addTwoNumbers(
        self,
        l1: Optional[ListNode],
        l2: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        carry = 0

        # 两条链表视为倒序数字；循环条件保留最后可能产生的一位进位。
        while l1 or l2 or carry:
            first_digit = l1.val if l1 else 0
            second_digit = l2.val if l2 else 0
            total = first_digit + second_digit + carry

            tail.next = ListNode(total % 10)
            tail = tail.next
            carry = total // 10

            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next

        return dummy.next
```

## 为什么循环条件包含进位

两个链表都到达末尾后，仍可能存在最高位进位。例如 `5 + 5 = 10`，处理完两个结点时 `carry = 1`，必须再创建一个值为 `1` 的结点。

## 正确性说明

每轮处理相同十进制位的两个数字与低位传来的进位，生成当前结果位并计算新进位，与竖式加法完全一致。较短链表缺失的位置按零处理，最终进位也会被写入，因此结果链表准确表示两数之和。

## 复杂度

- 时间复杂度：`O(max(m, n))`。
- 空间复杂度：`O(max(m, n))`，用于结果链表；额外工作空间为 `O(1)`。

## 边界用例

| `l1` | `l2` | 预期 | 检查点 |
|---|---|---|---|
| `2→4→3` | `5→6→4` | `7→0→8` | 基础路径 |
| `0` | `0` | `0` | 两个零 |
| `9→9→9` | `1` | `0→0→0→1` | 连续进位 |
| `1→8` | `0` | `1→8` | 长度不同 |

## 90 秒面试表达

“链表按逆序保存，头结点就是最低位，所以可以同步遍历并模拟竖式加法。每轮读取两个当前值，缺失按零处理，加上进位后用模 10 得到结果位、整除 10 得到新进位。我用虚拟头结点构建结果，循环条件包含进位，避免遗漏最高位。时间 `O(max(m,n))`，除结果链表外空间 `O(1)`。”

## 常见追问

- 如果数字按正序存储，可以先用栈保存数字，或先反转链表再相加。
- 如果要求复用原结点，需要明确是否允许修改输入。
- 如果每个结点保存多位数字，只需调整进制。
