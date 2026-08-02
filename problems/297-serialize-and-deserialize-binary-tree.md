# 297 · 二叉树的序列化与反序列化

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', '设计']"
  difficulty="hard"
  :appearances="59"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目与协议设计

把二叉树编码为字符串，并能从字符串完整恢复。只记录结点值无法区分不同结构，因此必须保存空结点标记。

这里使用前序协议：

```text
结点值, 左子树, 右子树
空结点记为 #
```

### 示例

```text
输入：root = [1, 2, 3, null, null, 4, 5]
序列化输出："1,2,#,#,3,4,#,#,5,#,#"
反序列化输出：[1, 2, 3, null, null, 4, 5]
解释：空结点标记保留了完整结构，因此反序列化可以恢复原树。
```

## Python 实现

```python
from collections import deque
from typing import Optional


class Codec:
    NULL = "#"
    SEPARATOR = ","

    def serialize(self, root: Optional[TreeNode]) -> str:
        values: list[str] = []

        def encode(node: Optional[TreeNode]) -> None:
            if node is None:
                values.append(self.NULL)
                return

            values.append(str(node.val))
            encode(node.left)
            encode(node.right)

        encode(root)
        return self.SEPARATOR.join(values)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        values = deque(data.split(self.SEPARATOR))

        def decode() -> Optional[TreeNode]:
            value = values.popleft()
            if value == self.NULL:
                return None

            node = TreeNode(int(value))
            # 前序协议决定接下来的两段依次属于左、右子树。
            node.left = decode()
            node.right = decode()
            return node

        return decode()
```

## 为什么能唯一恢复

前序值确定当前根，空标记明确每棵子树何时结束。反序列化按同一协议消费标记，每次递归唯一确定当前结点以及左右子树，因此编码与解码互为逆过程。

## 复杂度与工程追问

- 编解码都处理 `O(n)` 个结点和空标记，时间、结果空间均为 `O(n)`；递归栈 `O(h)`。
- 实际工程需考虑分隔符转义、版本号、异常输入、整数范围和递归深度。
- 层序编码同样可行，通常尾部会产生可裁剪的连续空标记。
