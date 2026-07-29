---
title: 大厂真题 · Redis 与缓存
description: Redis 性能、持久化与缓存穿透击穿雪崩的面试问题和具体回答。
---

# Redis 与缓存

## CQ07 · Redis 为什么快？

> 公开记录：字节后端一面公开面经。

### 面试回答

Redis 快不是单一原因：

1. 主要数据保存在内存，常规请求避免随机磁盘读取；
2. 字符串、哈希、集合、有序集合等结构针对操作语义设计，常用操作复杂度较低；
3. 命令执行路径短，核心命令通常串行执行，避免大量共享数据锁竞争；
4. 使用事件驱动 I/O 管理大量连接；
5. 支持 pipeline，一次网络往返可发送多条命令。

需要加一句边界：Redis 6 之后可使用 I/O 线程处理部分网络读写，因此“Redis 完全是单线程”是不准确的；多数命令的执行仍保持串行语义。

### Redis 也会慢

- `KEYS`、超大集合运算或 Lua 长脚本阻塞命令执行；
- 大 key 删除、过期回收和持久化 `fork` 可能造成延迟抖动；
- 网络往返多时，服务端再快也会被 RTT 限制；
- 内存接近上限会触发淘汰或操作系统压力。

### 常见追问

**既然串行执行，为什么吞吐还高？**

内存操作短、避免锁竞争，并通过事件循环和批量网络操作提高整体效率。串行不等于只能维护一个连接。

**如何验证“Redis 慢”？**

看慢日志、延迟监控、命令分布、大 key、CPU、网络、内存和持久化事件，而不是只看平均耗时。

### 技术资料

- [Redis data types](https://redis.io/docs/latest/develop/data-types/)
- [Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
- [Redis latency monitoring](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency-monitor/)

## CQ08 · Redis 如何降低断电后的数据丢失？RDB 和 AOF 怎么选？

> 公开记录：字节后端一面公开面经。

### 面试回答

Redis 提供两类主要持久化机制：

- **RDB**：按时间点生成数据集快照。文件紧凑、备份和全量恢复方便，但故障时可能丢失两次快照之间的数据；
- **AOF**：记录写命令，启动时重放恢复。可通过 `appendfsync always / everysec / no` 在性能和数据损失窗口之间取舍，文件通常更大，需要重写压缩历史。

如果 Redis 只是可重建缓存，可以关闭持久化；如果承担重要数据，常见选择是同时使用 RDB 与 AOF，并结合副本、故障转移和异地备份。持久化解决“重启后恢复”，副本解决“节点故障可用”，二者不是同一个问题。

### 不能承诺“绝不丢数据”

`everysec` 策略在极端故障时仍可能丢失约一秒数据；副本也可能存在复制延迟。回答时应先明确业务允许的 RPO（最多丢多少数据）和 RTO（多久恢复），再选择配置。

### 常见追问

**AOF 为什么需要重写？**

同一个键可能经历大量中间写操作，恢复只需要重建最终状态。重写生成更短的等价操作序列。

**RDB 的 `fork` 有什么风险？**

大数据集下创建子进程和写时复制会消耗时间与额外内存，可能带来延迟尖峰。

### 技术资料

- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)

## CQ09 · 缓存穿透、击穿和雪崩有什么区别？

> 公开记录：字节后端一面公开面经。

### 面试回答

三者按“未命中原因和影响范围”区分：

| 问题 | 典型现象 | 主要方案 |
|---|---|---|
| 穿透 | 请求的数据本来就不存在，每次都绕过缓存访问数据库 | 参数校验、缓存空值、布隆过滤器、防刷限流 |
| 击穿 | 一个热点 key 失效，大量并发同时回源 | 请求合并 / 互斥重建、逻辑过期、热点预热 |
| 雪崩 | 大量 key 同时失效或缓存集群整体不可用 | TTL 加随机抖动、分批预热、多级缓存、限流降级、高可用 |

### 具体回答方式

不要只背三个定义，还要先保护数据库：

1. 设置总回源并发上限；
2. 对热点 key 使用 singleflight 或互斥重建；
3. 缓存空值时设置较短 TTL，避免长期掩盖后来写入的数据；
4. 布隆过滤器只能判断“可能存在 / 一定不存在”，不能替代数据库；
5. 缓存集群不可用时必须有降级和熔断，不能让所有请求无限回源。

### 常见追问

**互斥锁重建缓存有什么风险？**

锁持有者失败会让其他请求长期等待，因此需要租约、超时和失败兜底；极端热点还要考虑逻辑过期。

**随机 TTL 能彻底解决雪崩吗？**

只能减少同时过期。节点故障、网络隔离或错误发布导致的整体不可用仍需要高可用、限流与降级。

### 技术资料

- [Redis key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis EXPIRE](https://redis.io/docs/latest/commands/expire/)
