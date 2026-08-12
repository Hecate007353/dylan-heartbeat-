# 项目核心说明

## 项目目标

Erebus不是普通聊天机器人。
目标是构建长期交互助手。

## Memory设计

memory分为：

1. 核心长期记忆
- importance高
- 永久保留
- 不参与普通相关检索排序

2. 相关记忆
- extraction_terms负责召回
- 根据当前聊天匹配

3. memory管理员
负责判断新增、更新、删除。

## 当前阶段

当前主要任务：
稳定memory系统。

## 当前已知问题

1. extraction_terms检索异常
2. memory管理员多update行为需要确认
3. recall策略优化

## 修改原则

不要大规模重构。
先分析，再修改。
保持现有架构。
