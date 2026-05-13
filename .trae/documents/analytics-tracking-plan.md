# SVG Code to PNG - 埋点分析计划

## 文档信息
- **版本**: 1.1
- **日期**: 2026-05-13
- **变更**: 新增颜色编辑功能埋点

---

## 1. 埋点策略
### 1.1 埋点目标
- 跟踪核心转化漏斗：访问 → 编辑 → 预览 → 转换 → 下载
- 了解用户使用行为和偏好
- 优化功能体验
- A/B 测试支持

### 1.2 埋点架构
- 使用 Google Analytics 4 (GA4) 作为数据源
- 通过 `window.gtag` 发送事件
- 开发环境有日志输出，生产环境静默

### 1.3 事件命名规范
- 使用 `snake_case`
- 格式：`{模块}_{动作}`
- 例如：`color_tab_open`, `color_replace_single`

---

## 2. 埋点清单

### 2.1 基础埋点（已有）
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `page_view` | `page_title`, `page_path` | 页面加载 | P0 |
| `switch_language` | `language` | 切换语言 | P1 |
| `switch_theme` | `theme` | 切换主题 | P1 |

### 2.2 核心转化漏斗
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `converter_start` | `mode` (svg/html) | 首次进入编辑器 | P0 |
| `editor_code_change` | `mode`, `code_length` | 编辑器内容变化 | P1 |
| `editor_action` | `action` (copy/clear/reset) | 编辑器操作 | P1 |
| `convert_image` | `format`, `mode`, `quality`, `width`, `height` | 点击转换按钮 | P0 |
| `download_image` | `format`, `mode` | 点击下载按钮 | P0 |

### 2.3 颜色编辑功能埋点（新增）
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `color_tab_open` | `color_count` | 用户打开颜色编辑标签 | P0 |
| `color_replace_single` | `old_color`, `new_color`, `method` (wheel/input) | 替换单个颜色 | P0 |
| `color_replace_all` | `new_color` | 替换所有颜色 | P0 |
| `color_preset_used` | `palette_id`, `palette_name`, `color_index` | 使用预设色板 | P0 |
| `color_reset_all` | - | 重置所有颜色 | P1 |
| `color_wheel_open` | `color` | 打开色轮选择器 | P1 |
| `color_picker_closed` | - | 关闭色轮选择器 | P1 |

### 2.4 Settings 面板埋点
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `settings_open` | - | 打开 Settings 面板 | P1 |
| `settings_tab_switch` | `tab` (format/color) | 切换标签页 | P1 |
| `settings_format_change` | `format` | 切换导出格式 | P1 |
| `settings_quality_change` | `quality` | 调整质量 | P1 |
| `settings_dimension_change` | `width`, `height` | 调整尺寸 | P1 |

### 2.5 导航与页面转化
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `nav_click` | `section` (hero/features/faq/etc) | 点击导航栏链接 | P2 |
| `hero_cta_click` | - | 点击 Hero CTA 按钮 | P0 |
| `hero_convert_quick` | - | 使用 Hero 快速转换 | P0 |
| `footer_click` | `link` | 点击 Footer 链接 | P2 |

### 2.6 AI 助手埋点（已有）
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `ai_assistant_enter` | - | 打开 AI 助手 | P0 |
| `ai_assistant_send` | `prompt_type`, `prompt_length` | 发送 AI 请求 | P0 |
| `ai_assistant_quick_prompt` | `prompt_label` | 使用快速提示词 | P1 |
| `ai_assistant_rollback` | `version_number` | 回滚版本 | P1 |
| `ai_assistant_diff_view` | - | 查看差异 | P1 |
| `ai_assistant_clear_history` | - | 清空历史 | P1 |

### 2.7 模板画廊埋点
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `template_gallery_view` | `scroll_depth` | 浏览模板画廊 | P1 |
| `template_preview` | `template_id` | 预览模板 | P0 |
| `template_copy` | `template_id` | 复制模板代码 | P0 |

### 2.8 错误与异常埋点
| 事件名 | 事件参数 | 触发时机 | 优先级 |
|--------|---------|---------|--------|
| `conversion_error` | `error_type`, `error_message` | 转换出错 | P0 |
| `editor_error` | `error_message` | 编辑器错误 | P1 |
| `ai_assistant_error` | `error_type` | AI 错误 | P0 |

---

## 3. 核心指标与漏斗

### 3.1 核心漏斗指标
```
Page Views → Converter Enter → Preview Update → Convert → Download
```

### 3.2 转化指标
| 指标 | 计算公式 | 目标值 |
|------|---------|--------|
| 进入率 | Converter Enter / Page Views | 50% |
| 转换率 | Convert / Converter Enter | 30% |
| 下载率 | Download / Convert | 85% |
| 颜色编辑使用率 | Color Tab Open / Converter Enter | 20% |
| 预设色板使用率 | Color Preset Used / Color Tab Open | 40% |

---

## 4. 颜色编辑功能深度分析

### 4.1 核心关注点
1. 颜色功能使用率
2. 单个替换 vs 全部替换使用比例
3. 色轮 vs 直接输入使用偏好
4. 预设色板受欢迎程度

### 4.2 分析维度
| 维度 | 说明 |
|------|------|
| 颜色数量 | 检测到的颜色数量是否影响使用率 |
| 使用时长 | 用户在颜色编辑上花费的时间 |
| 修改次数 | 平均修改次数 |
| 预设喜好 | 哪些预设色板最受欢迎 |

---

## 5. 埋点实现清单

| 功能模块 | 状态 |
|---------|------|
| 基础埋点 | ✅ 已有 |
| AI 助手埋点 | ✅ 已有 |
| 颜色编辑埋点 | ⏳ 待实现 |
| Settings 面板埋点 | ⏳ 待实现 |
| 导航转化埋点 | ⏳ 待实现 |
| 错误埋点 | ⏳ 待实现 |

---

## 6. 数据分析报表示例

### 6.1 颜色编辑每日使用
| 日期 | 打开人次 | 使用预设 | 单个替换 | 全部替换 | 重置次数 |
|------|---------|---------|---------|---------|---------|
| 2026-05-01 | 120 | 52 | 78 | 32 | 18 |

### 6.2 预设色板排名
| 色板名 | 使用次数 | 占比 |
|-------|---------|------|
| Sunset Glow | 48 | 25% |
| Modern Corporate | 42 | 22% |
| Serenity Calm | 35 | 18% |
