# 腾讯原创题单 05 · 微信红包随机分配

<ProblemMeta
  :tags="['腾讯原创题单', '腾讯面试题', '数学', '随机算法']"
  difficulty="medium"
  :appearances="6"
  pass-rate="16%"
/>

<ComplexityBadge
  time="O(n)"
  space="O(n)"
/>

> 本页讲解的是面试中常见的红包随机分配模型，不代表微信线上系统的真实实现。截图中的“原创”是题单分类；本站没有找到腾讯官方公开的完整题面，因此把金额单位、最小金额和随机策略明确写入约定，避免依赖含糊假设。

## 题目

给定红包总金额 `total_cents` 和红包个数 `packet_count`，请随机生成 `packet_count` 份红包金额。

金额统一使用整数“分”表示，并满足：

1. 每份红包至少为 `1` 分；
2. 所有红包金额之和严格等于 `total_cents`；
3. 生成过程采用面试中常见的二倍均值法：还剩 `remaining` 分、`remaining_count` 份时，当前红包从 `1` 到 `2 × remaining / remaining_count` 附近的整数区间中随机产生；
4. 必须保证剩余红包仍然能够每份至少分到 `1` 分；
5. 最后一份红包直接领取全部剩余金额。

### 接口约定

```python
splitRedPacket(total_cents, packet_count, rng=None) -> list[int]
```

- `rng` 是可选的随机数生成器，便于固定种子测试；
- 返回列表中的每个整数都是一份红包的金额，单位为分；
- 返回顺序表示依次领取的顺序。

### 数据范围

- `1 <= packet_count <= 10^5`；
- `packet_count <= total_cents <= 10^9`；
- 输入金额已经转换成整数分，不使用浮点数。

## 示例

```text
输入：total_cents = 20, packet_count = 4
输出：[6, 8, 5, 1]
```

这只是一次可能的结果。它满足：

```text
6 + 8 + 5 + 1 = 20
```

并且每份都不少于 1 分。

## 为什么金额要使用整数分

如果使用 `float` 表示元，`0.1 + 0.2` 之类的运算可能无法得到精确十进制结果，最后一份红包就可能出现：

- 总额差 1 分；
- 负数；
- 显示金额与结算金额不一致。

金额计算应尽早转换为最小货币单位，本题直接使用整数分。最终展示时再格式化为元。

## 二倍均值法

还剩 `remaining` 分、`remaining_count` 份红包时，当前剩余平均值是：

```text
remaining / remaining_count
```

把当前红包随机上界设在平均值的两倍附近：

```text
2 × remaining / remaining_count
```

这样既允许产生大小不同的红包，又能降低早期一次拿走绝大部分金额的概率。

不过只限制二倍均值还不够。当前取走金额后，必须至少留下：

```text
remaining_count - 1
```

分给后面的红包。因此随机上界应取：

```text
min(
    floor(2 × remaining / remaining_count),
    remaining - (remaining_count - 1)
)
```

## Python 实现

```python
import random


class Solution:
    def splitRedPacket(
        self,
        total_cents: int,
        packet_count: int,
        rng: random.Random | None = None,
    ) -> list[int]:
        if packet_count <= 0:
            raise ValueError("红包个数必须是正整数")
        if total_cents < packet_count:
            raise ValueError("总金额不足以保证每份至少 1 分")

        random_source = rng if rng is not None else random
        remaining = total_cents
        result: list[int] = []

        for remaining_count in range(packet_count, 1, -1):
            # 至少为后面的每份红包预留 1 分。
            max_available = remaining - (remaining_count - 1)

            # 使用整数运算得到二倍均值上界，避免浮点误差。
            double_average = (
                2 * remaining // remaining_count
            )
            upper_bound = min(
                max_available,
                double_average,
            )

            amount = random_source.randint(1, upper_bound)
            result.append(amount)
            remaining -= amount

        # 前面始终预留了金额，最后一份一定至少为 1 分。
        result.append(remaining)
        return result
```

## 正确性说明

我们维护下面两个不变量：

1. `remaining >= remaining_count`，也就是剩余金额足够让每份至少得到 1 分；
2. 已分配金额之和加上 `remaining` 始终等于 `total_cents`。

开始时题目保证 `total_cents >= packet_count`，两个不变量成立。

某轮最多取走：

```text
remaining - (remaining_count - 1)
```

所以取走后至少还剩 `remaining_count - 1` 分，足够分给剩余的 `remaining_count - 1` 份红包，第一个不变量继续成立。

每轮只是把 `amount` 从 `remaining` 移入结果列表，没有创建或丢失金额，所以第二个不变量也始终成立。

循环结束时只剩一份红包。把全部 `remaining` 放入结果后：

- 每份金额都至少为 1 分；
- 结果长度恰好为 `packet_count`；
- 所有金额之和恰好为 `total_cents`。

因此算法满足题目中的金额约束。

## “随机”不等于“所有拆分等概率”

二倍均值法的目标是限制单次随机范围并控制极端值。它不保证所有合法整数拆分方案具有完全相同的概率，整数取整也会带来轻微偏差。

如果面试官要求“每一种正整数拆分都严格等概率”，应改用随机切点：

1. 在 `1...total_cents - 1` 中等概率选择 `packet_count - 1` 个不同切点；
2. 将切点排序；
3. 相邻边界的差就是每份红包金额。

```python
import random


def split_uniformly(
    total_cents: int,
    packet_count: int,
    rng: random.Random | None = None,
) -> list[int]:
    if packet_count <= 0:
        raise ValueError("红包个数必须是正整数")
    if total_cents < packet_count:
        raise ValueError("总金额不足以保证每份至少 1 分")

    random_source = rng if rng is not None else random
    cuts = sorted(
        random_source.sample(
            range(1, total_cents),
            packet_count - 1,
        )
    )

    result: list[int] = []
    previous = 0
    for current in [*cuts, total_cents]:
        result.append(current - previous)
        previous = current
    return result
```

每组有序正整数拆分与一组切点一一对应，因此随机切点法能让所有合法拆分严格等概率，但更容易产生极小或极大的红包。

## 复杂度

对于二倍均值法：

- 生成 `packet_count` 份红包，时间复杂度为 `O(packet_count)`；
- 返回列表占用 `O(packet_count)` 空间，除输出外只使用 `O(1)` 额外变量。

对于严格均匀的随机切点法：

- 排序切点需要 `O(packet_count log packet_count)` 时间；
- 切点和结果占用 `O(packet_count)` 空间。

## 边界用例

| 场景 | 预期 |
|---|---|
| `packet_count = 1` | 返回 `[total_cents]` |
| `total_cents = packet_count` | 每份都只能是 1 分 |
| `total_cents < packet_count` | 抛出 `ValueError` |
| `packet_count <= 0` | 抛出 `ValueError` |
| 固定随机种子 | 每次得到相同结果，便于测试 |
| 大金额、大份数 | 不使用浮点数，总额仍严格守恒 |

## 工程实现还要考虑什么

面试中的随机拆分只是核心算法。真实红包系统还要处理：

- 并发领取与防止超发；
- 请求幂等与重复领取；
- 数据库、缓存和账务的一致性；
- 随机源是否需要具备安全性；
- 风控、限流、审计与失败补偿。

Python 的 `random` 是伪随机生成器，适合算法演示和普通模拟，不适合直接承担真实资金场景中的安全随机需求。

## 60～90 秒口述稿

我先把金额统一转换成整数分，避免浮点误差。每轮还剩 `remaining` 分和 `remaining_count` 份红包时，用二倍均值 `2 × remaining / remaining_count` 作为随机上界；同时上界不能超过 `remaining - remaining_count + 1`，因为要给后面每份至少预留 1 分。

当前金额从 1 到这个上界随机产生，最后一份直接拿走剩余金额。这样始终保持“剩余金额不少于剩余份数”和“已分配加剩余等于总额”两个不变量，所以每份为正且总和严格正确。

算法时间 `O(n)`，输出空间 `O(n)`。我还会主动说明，二倍均值法不是对所有拆分方案严格均匀；如果面试官要求严格等概率，可以改用随机切点法。

## 常见追问

### 1. 为什么最后一份不会变成 0？

每轮最多取走 `remaining - (remaining_count - 1)`，始终为后续每份预留 1 分。因此最后一份至少有 1 分。

### 2. 为什么不能用 round 或浮点数修正最后误差？

资金算法应该从模型上保证守恒，而不是把累计误差全部塞给最后一个人。使用整数分可以让每一步都精确。

### 3. 二倍均值法公平吗？

它让每轮随机区间围绕当前平均值变化，并限制极端值，但不保证所有合法拆分严格等概率。回答时要先确认面试官所说“公平”的精确定义。

### 4. 这就是微信真实红包算法吗？

不能这样声称。公开讨论中的二倍均值法是常见面试模型，真实线上实现还会涉及安全、并发、风控和账务等大量未公开细节。
