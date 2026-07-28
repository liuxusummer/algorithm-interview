# 021 · 合并两个有序链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '归并', '华为面试题']"
  difficulty="easy"
  :appearances="63"
  pass-rate="58%"
  source-url="https://leetcode.cn/problems/merge-two-sorted-lists/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(m + n)" space="O(1) / O(m + n)" />

## 题目

将两个非递减顺序的单链表合并为一个新的非递减链表。新链表由两个输入链表的原有结点组成。

### 示例

```text
输入：1 → 2 → 4，1 → 3 → 4
输出：1 → 1 → 2 → 3 → 4 → 4
```

## 解法一：迭代归并

两个指针分别指向两条链表当前最小的未处理结点。每次把值较小的结点接到结果尾部，并移动对应指针。

虚拟头结点可以避免单独处理结果链表的第一个结点。

### Python 实现

```python
from typing import Optional


class Solution:
    def mergeTwoLists(
        self,
        list1: Optional[ListNode],
        list2: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy

        # 每次接入较小头结点，tail 始终指向已合并链表的末尾。
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next

            tail = tail.next

        tail.next = list1 if list1 else list2
        return dummy.next
```

### 为什么剩余部分可以整体连接

当一条链表耗尽时，另一条链表剩余结点本身已经有序，并且所有值都不小于结果尾部，因此无需逐个处理，可以直接连接。

### 正确性说明

每轮从两条链表的最小未处理结点中选择较小者，它一定是所有剩余结点的最小值。追加后结果仍然有序。循环结束时将另一条有序后缀整体连接，最终包含全部结点且保持非递减顺序。

### 复杂度

- 时间复杂度：`O(m + n)`。
- 空间复杂度：`O(1)`，复用输入结点。

## 解法二：递归归并

把问题定义为 `merge(list1, list2)`：返回两条有序链表合并后的头结点。

- 如果一条链表为空，另一条链表就是完整答案，这是递归终止条件。
- 否则比较两个头结点，较小者一定是合并后链表的头结点。
- 选定头结点后，只需递归合并“该链表剩余部分”和另一条链表，再把递归结果接到当前结点的 `next`。

### Python 实现

```python
from typing import Optional


class Solution:
    def mergeTwoLists(
        self,
        list1: Optional[ListNode],
        list2: Optional[ListNode],
    ) -> Optional[ListNode]:
        # 只剩一条链表时，它本身已有序，可以直接作为剩余答案。
        if list1 is None:
            return list2
        if list2 is None:
            return list1

        # 较小的头结点负责当前这一位，其余部分交给递归处理。
        if list1.val <= list2.val:
            list1.next = self.mergeTwoLists(list1.next, list2)
            return list1

        list2.next = self.mergeTwoLists(list1, list2.next)
        return list2
```

### 递归过程示意

以 `1→2→4` 和 `1→3→4` 为例：

1. 两个头结点都是 `1`，选择第一条链表的 `1`；
2. 递归合并 `2→4` 与 `1→3→4`，选择第二条链表的 `1`；
3. 继续递归比较 `2` 和 `3`，选择 `2`；
4. 任意一条链表耗尽后，直接返回另一条链表的剩余后缀；
5. 递归逐层返回并连接，得到 `1→1→2→3→4→4`。

### 正确性说明

对两条链表的结点总数做归纳：

- 其中一条链表为空时，直接返回另一条有序链表，结论成立。
- 两条链表都非空时，较小的头结点一定是全部剩余结点中的最小值，因此它必然是答案的头结点。去掉该结点后，递归调用会正确合并规模更小的两条有序链表。把递归结果接在当前头结点之后，便得到包含全部结点的非递减链表。

因此递归算法正确。

### 复杂度

- 时间复杂度：`O(m + n)`，每次递归至少消费一个结点。
- 空间复杂度：`O(m + n)`，最坏情况下递归调用栈包含全部结点；这里不把输出链表计入额外空间。

## 边界用例

| `list1` | `list2` | 预期 | 检查点 |
|---|---|---|---|
| `1→2→4` | `1→3→4` | `1→1→2→3→4→4` | 基础路径 |
| 空 | 空 | 空 | 两者为空 |
| 空 | `0` | `0` | 单侧为空 |
| `1→1` | `1→1` | `1→1→1→1` | 重复值 |

## 90 秒面试表达

“两条链表都已经有序。迭代解法用两个指针比较当前结点，把较小结点接到结果尾部；虚拟头结点可以消除首次插入的特殊处理。一条链表耗尽后，直接连接另一条的有序后缀。递归解法则让较小头结点成为当前答案的头，再递归合并剩余部分。两种写法的时间复杂度都是 `O(m+n)`；迭代额外空间是 `O(1)`，递归会使用 `O(m+n)` 调用栈，所以工程中通常优先迭代。”

## 常见追问

- Python 默认递归深度有限，链表很长时递归写法可能触发 `RecursionError`，工程中优先使用迭代。
- 合并 K 条链表可以使用最小堆或分治归并。
- 如果不能修改输入，需要创建新结点。
