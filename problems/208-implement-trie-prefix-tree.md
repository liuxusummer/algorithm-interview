# 208 · 实现 Trie（前缀树）

<ProblemMeta
  :tags="['Hot100', '大厂面试', '设计', 'Trie']"
  difficulty="medium"
  :appearances="42"
  pass-rate="72%"
  source-url="https://leetcode.cn/problems/implement-trie-prefix-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(L)" space="O(total chars)" />

## 数据结构语义

Trie 把相同前缀共享为一条路径。每个结点维护：

- `children`：下一个字符到子结点的映射；
- `is_end`：是否有完整单词在此结束。

不能仅凭路径存在判断单词存在，例如插入 `apple` 后，`app` 是前缀但还不是完整单词。

## Python 实现

```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False


class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for character in word:
            if character not in node.children:
                node.children[character] = TrieNode()
            node = node.children[character]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None

    def _find(self, text: str) -> TrieNode | None:
        node = self.root
        for character in text:
            if character not in node.children:
                return None
            node = node.children[character]
        return node
```

## 正确性与复杂度

从根沿字符依次走过的路径与字符串前缀一一对应。插入在末端设置结束标记；`search` 同时检查路径和结束标记，`startsWith` 只检查路径，因此三种操作语义正确。长度为 `L` 的操作时间 `O(L)`；空间与所有不共享的字符结点总数同阶。

## 工程追问

- 字符集固定且很小时可用定长数组代替哈希表，提高常数性能。
- 删除单词时要处理共享前缀，可维护经过计数和结尾计数。
- 自动补全还可在结点中缓存高频候选。
