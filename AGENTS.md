# Erebus Development Rules

## 项目定位

Erebus 是长期运行的 AI assistant 项目。

核心模块：
- server.js
- memory.js
- wake_up.js

## 修改原则

1. 修改前先分析，不直接重构。
2. 优先小范围修改。
3. 保留现有架构。
4. 修改后说明影响范围。

## Memory设计原则

memory 使用 Supabase 表 erebus_memory。

核心字段：
- content
- keywords
- extraction_terms
- category
- importance

注意：

importance 是记忆管理的重要属性，但不是检索召回的主要依据。

检索主要依靠 extraction_terms 匹配。

## 当前重点问题

正在排查 memory.js 中 searchMemoryByContent。

已确认：

- Supabase extraction_terms 字段为 jsonb。
- 数据库存储格式正确。
- 现有 memory 数据已人工检查。
- 不要默认认为数据库数据格式错误。

重点检查：
- 查询逻辑
- Supabase jsonb contains 使用方式
- 参数传递过程

## 修改要求

不要：
- 大规模重构
- 修改无关模块
- 改变已有设计目标

任何修改前先说明：
1. 原因
2. 修改文件
3. 可能影响
