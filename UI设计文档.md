# LowCodeX UI设计文档

## 目录

1. [设计原则](#设计原则)
2. [色彩系统](#色彩系统)
3. [排版系统](#排版系统)
4. [布局系统](#布局系统)
5. [组件设计](#组件设计)
   - [表单设计器](#表单设计器)
   - [工作流设计器](#工作流设计器)
   - [数据模型设计器](#数据模型设计器)
   - [页面设计器](#页面设计器)
6. [响应式设计](#响应式设计)
7. [交互设计](#交互设计)
8. [主题系统](#主题系统)

## 设计原则

LowCodeX 平台的UI设计遵循以下核心原则：

1. **简洁高效** - 减少干扰，突出重点，帮助用户高效完成任务
2. **一致性** - 视觉和交互模式保持一致，降低学习成本
3. **灵活性** - 适应不同场景和用户需求的灵活配置
4. **专业性** - 面向专业领域用户，提供精准而强大的功能
5. **反馈清晰** - 用户操作后提供及时、明确的反馈

## 色彩系统

LowCodeX 平台采用专业、现代的色彩系统，确保界面赏心悦目且功能清晰。

### 主色调

```
主品牌色：#1890FF
辅助色：#1890FF (10% - 90% 色阶变化)
```

<svg width="600" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="580" height="60" rx="4" fill="#1890FF" />
  <text x="300" y="45" font-family="Arial" font-size="18" text-anchor="middle" fill="white">品牌主色 #1890FF</text>
</svg>

### 功能色

```
成功色：#52C41A
警告色：#FAAD14
错误色：#F5222D
信息色：#1890FF
```

<svg width="600" height="250" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="580" height="50" rx="4" fill="#52C41A" />
  <text x="300" y="40" font-family="Arial" font-size="16" text-anchor="middle" fill="white">成功色 #52C41A</text>

  <rect x="10" y="70" width="580" height="50" rx="4" fill="#FAAD14" />
  <text x="300" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="white">警告色 #FAAD14</text>

  <rect x="10" y="130" width="580" height="50" rx="4" fill="#F5222D" />
  <text x="300" y="160" font-family="Arial" font-size="16" text-anchor="middle" fill="white">错误色 #F5222D</text>

  <rect x="10" y="190" width="580" height="50" rx="4" fill="#1890FF" />
  <text x="300" y="220" font-family="Arial" font-size="16" text-anchor="middle" fill="white">信息色 #1890FF</text>
</svg>

### 中性色

```
标题文字：#262626
主要文字：#595959
次要文字：#8C8C8C
辅助文字：#BFBFBF
边框色：#D9D9D9
分割线：#F0F0F0
背景色：#F5F5F5
表格头部：#FAFAFA
```

<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#262626" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">标题文字 #262626</text>

  <rect x="10" y="60" width="580" height="40" rx="4" fill="#595959" />
  <text x="300" y="85" font-family="Arial" font-size="16" text-anchor="middle" fill="white">主要文字 #595959</text>

  <rect x="10" y="110" width="580" height="40" rx="4" fill="#8C8C8C" />
  <text x="300" y="135" font-family="Arial" font-size="16" text-anchor="middle" fill="white">次要文字 #8C8C8C</text>

  <rect x="10" y="160" width="580" height="40" rx="4" fill="#BFBFBF" />
  <text x="300" y="185" font-family="Arial" font-size="16" text-anchor="middle" fill="white">辅助文字 #BFBFBF</text>

  <rect x="10" y="210" width="580" height="40" rx="4" fill="#D9D9D9" stroke="#8C8C8C" stroke-width="1" />
  <text x="300" y="235" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">边框色 #D9D9D9</text>

  <rect x="10" y="260" width="580" height="40" rx="4" fill="#F0F0F0" stroke="#8C8C8C" stroke-width="1" />
  <text x="300" y="285" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">分割线 #F0F0F0</text>

  <rect x="10" y="310" width="580" height="40" rx="4" fill="#F5F5F5" stroke="#8C8C8C" stroke-width="1" />
  <text x="300" y="335" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">背景色 #F5F5F5</text>

  <rect x="10" y="360" width="580" height="40" rx="4" fill="#FAFAFA" stroke="#8C8C8C" stroke-width="1" />
  <text x="300" y="385" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">表格头部 #FAFAFA</text>
</svg>

## 排版系统

LowCodeX 平台采用清晰、易读的排版系统，确保内容层次分明，提升用户体验。

### 字体

```
默认字体：-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif
代码字体：'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace
```

### 字号与行高

<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="30" font-family="Arial" font-size="28" fill="#262626">标题一 (28px)</text>
  <line x1="10" y1="40" x2="590" y2="40" stroke="#F0F0F0" stroke-width="1" />

  <text x="10" y="80" font-family="Arial" font-size="24" fill="#262626">标题二 (24px)</text>
  <line x1="10" y1="90" x2="590" y2="90" stroke="#F0F0F0" stroke-width="1" />

  <text x="10" y="130" font-family="Arial" font-size="20" fill="#262626">标题三 (20px)</text>
  <line x1="10" y1="140" x2="590" y2="140" stroke="#F0F0F0" stroke-width="1" />

  <text x="10" y="180" font-family="Arial" font-size="16" fill="#262626">标题四 (16px)</text>
  <line x1="10" y1="190" x2="590" y2="190" stroke="#F0F0F0" stroke-width="1" />

  <text x="10" y="230" font-family="Arial" font-size="14" fill="#595959">正文 (14px)</text>
  <line x1="10" y1="240" x2="590" y2="240" stroke="#F0F0F0" stroke-width="1" />

  <text x="10" y="280" font-family="Arial" font-size="12" fill="#8C8C8C">辅助文字 (12px)</text>
  <line x1="10" y1="290" x2="590" y2="290" stroke="#F0F0F0" stroke-width="1" />
</svg>

### 字重

```
极细体: 100
细体: 300
常规体: 400
中黑体: 500
黑体: 600
极黑体: 700
```

## 布局系统

LowCodeX 平台采用灵活、一致的布局系统，确保各类功能设计器有统一的操作体验。

### 基础栅格系统

平台基于24列栅格系统进行布局设计，支持响应式设计，适应不同尺寸的屏幕。

<svg width="600" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="580" height="100" rx="0" fill="#F5F5F5" />

  <!-- 栅格线 -->
  <g stroke="#D9D9D9" stroke-width="1" stroke-dasharray="5,5">
    <line x1="34" y1="10" x2="34" y2="110" />
    <line x1="58" y1="10" x2="58" y2="110" />
    <line x1="82" y1="10" x2="82" y2="110" />
    <line x1="106" y1="10" x2="106" y2="110" />
    <line x1="130" y1="10" x2="130" y2="110" />
    <line x1="154" y1="10" x2="154" y2="110" />
    <line x1="178" y1="10" x2="178" y2="110" />
    <line x1="202" y1="10" x2="202" y2="110" />
    <line x1="226" y1="10" x2="226" y2="110" />
    <line x1="250" y1="10" x2="250" y2="110" />
    <line x1="274" y1="10" x2="274" y2="110" />
    <line x1="298" y1="10" x2="298" y2="110" />
    <line x1="322" y1="10" x2="322" y2="110" />
    <line x1="346" y1="10" x2="346" y2="110" />
    <line x1="370" y1="10" x2="370" y2="110" />
    <line x1="394" y1="10" x2="394" y2="110" />
    <line x1="418" y1="10" x2="418" y2="110" />
    <line x1="442" y1="10" x2="442" y2="110" />
    <line x1="466" y1="10" x2="466" y2="110" />
    <line x1="490" y1="10" x2="490" y2="110" />
    <line x1="514" y1="10" x2="514" y2="110" />
    <line x1="538" y1="10" x2="538" y2="110" />
    <line x1="562" y1="10" x2="562" y2="110" />
  </g>

  <text x="300" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#8C8C8C">24列栅格系统</text>
</svg>

### 间距标准

基于8px倍数的间距系统，保证界面布局整齐统一。

```
超小间距: 4px
小间距: 8px
中间距: 16px
大间距: 24px
超大间距: 32px
```

<svg width="600" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 4px -->
  <rect x="10" y="10" width="100" height="30" rx="2" fill="#1890FF" />
  <rect x="114" y="10" width="100" height="30" rx="2" fill="#1890FF" />
  <text x="260" y="30" font-family="Arial" font-size="14" fill="#595959">超小间距 4px</text>

  <!-- 8px -->
  <rect x="10" y="60" width="100" height="30" rx="2" fill="#1890FF" />
  <rect x="118" y="60" width="100" height="30" rx="2" fill="#1890FF" />
  <text x="260" y="80" font-family="Arial" font-size="14" fill="#595959">小间距 8px</text>

  <!-- 16px -->
  <rect x="10" y="110" width="100" height="30" rx="2" fill="#1890FF" />
  <rect x="126" y="110" width="100" height="30" rx="2" fill="#1890FF" />
  <text x="260" y="130" font-family="Arial" font-size="14" fill="#595959">中间距 16px</text>

  <!-- 24px -->
  <rect x="10" y="160" width="100" height="30" rx="2" fill="#1890FF" />
  <rect x="134" y="160" width="100" height="30" rx="2" fill="#1890FF" />
  <text x="260" y="180" font-family="Arial" font-size="14" fill="#595959">大间距 24px</text>

  <!-- 32px -->
  <rect x="10" y="210" width="100" height="30" rx="2" fill="#1890FF" />
  <rect x="142" y="210" width="100" height="30" rx="2" fill="#1890FF" />
  <text x="260" y="230" font-family="Arial" font-size="14" fill="#595959">超大间距 32px</text>
</svg>

### 常用布局模式

#### 经典三栏式设计器布局

LowCodeX 平台的设计器普遍采用三栏式布局，左侧为工具/组件面板，中间为设计画布，右侧为属性配置面板。

<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- 布局框架 -->
  <rect x="10" y="10" width="580" height="280" rx="4" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2" />

  <!-- 顶部工具栏 -->
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#1890FF" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">设计器工具栏</text>

  <!-- 左侧面板 -->
  <rect x="10" y="50" width="140" height="240" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">组件面板</text>
  <text x="80" y="120" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">(工具面板)</text>

  <!-- 中间画布 -->
  <rect x="150" y="50" width="300" height="240" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="170" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">设计画布</text>

  <!-- 右侧面板 -->
  <rect x="450" y="50" width="140" height="240" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">属性面板</text>
  <text x="520" y="120" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">(配置面板)</text>
</svg>

#### 应用页面布局

LowCodeX 平台的应用界面采用现代企业级应用的布局结构。

<svg width="600" height="350" xmlns="http://www.w3.org/2000/svg">
  <!-- 布局框架 -->
  <rect x="10" y="10" width="580" height="330" rx="0" fill="#F5F5F5" />

  <!-- 顶部导航 -->
  <rect x="10" y="10" width="580" height="50" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="20" width="120" height="30" rx="0" fill="#1890FF" />
  <text x="80" y="40" font-family="Arial" font-size="14" text-anchor="middle" fill="white">LowCodeX</text>
  <circle cx="540" cy="35" r="15" fill="#D9D9D9" />
  <text x="540" y="40" font-family="Arial" font-size="14" text-anchor="middle" fill="#FFF">用户</text>

  <!-- 左侧菜单 -->
  <rect x="10" y="60" width="150" height="280" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="10" y="60" width="150" height="40" rx="0" fill="#E6F7FF" stroke="#1890FF" stroke-width="0" />
  <text x="80" y="85" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">工作台</text>
  <text x="80" y="125" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">表单设计</text>
  <text x="80" y="165" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">流程设计</text>
  <text x="80" y="205" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">数据模型</text>
  <text x="80" y="245" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">应用管理</text>
  <text x="80" y="285" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">系统设置</text>

  <!-- 内容区 -->
  <rect x="160" y="60" width="430" height="280" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="85" font-family="Arial" font-size="16" fill="#262626">工作台</text>
  <line x1="160" y1="95" x2="590" y2="95" stroke="#F0F0F0" stroke-width="1" />

  <!-- 内容卡片 -->
  <rect x="175" y="110" width="180" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="175" y="110" width="180" height="40" rx="2" fill="#FAFAFA" />
  <text x="265" y="135" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">待办任务</text>
  <text x="265" y="170" font-family="Arial" font-size="24" text-anchor="middle" fill="#1890FF">12</text>

  <rect x="395" y="110" width="180" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="395" y="110" width="180" height="40" rx="2" fill="#FAFAFA" />
  <text x="485" y="135" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">我的应用</text>
  <text x="485" y="170" font-family="Arial" font-size="24" text-anchor="middle" fill="#1890FF">5</text>

  <rect x="175" y="225" width="400" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="175" y="225" width="400" height="40" rx="2" fill="#FAFAFA" />
  <text x="375" y="250" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">最近活动</text>
</svg>

## 组件设计

LowCodeX 平台的核心功能模块采用统一的设计语言，以确保用户在不同模块间切换时能保持一致的体验。

### 表单设计器

表单设计器是LowCodeX平台的核心功能之一，用于可视化构建数据录入表单。

#### 整体布局设计

<svg width="600" height="380" xmlns="http://www.w3.org/2000/svg">
  <!-- 整体框架 -->
  <rect x="10" y="10" width="580" height="360" rx="4" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2" />

  <!-- 顶部工具栏 -->
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#1890FF" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">表单设计器工具栏</text>

  <!-- 左侧组件面板 -->
  <rect x="10" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="80" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">组件库</text>

  <!-- 组件分类 -->
  <rect x="20" y="100" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="117" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">基础组件</text>

  <!-- 组件列表 -->
  <rect x="25" y="130" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="145" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">单行文本</text>

  <rect x="25" y="157" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="172" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">多行文本</text>

  <rect x="25" y="184" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="199" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">数字输入</text>

  <rect x="25" y="211" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="226" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">下拉选择</text>

  <rect x="20" y="245" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="262" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">高级组件</text>

  <rect x="25" y="275" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="290" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">文件上传</text>

  <rect x="25" y="302" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="317" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">富文本编辑器</text>

  <rect x="25" y="329" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="344" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">图片上传</text>

  <!-- 中间设计画布 -->
  <rect x="150" y="50" width="300" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="75" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">设计画布</text>

  <!-- 表单元素 -->
  <rect x="170" y="100" width="260" height="40" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="200" y="125" font-family="Arial" font-size="14" fill="#595959">用户名：</text>
  <rect x="250" y="105" width="160" height="30" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />

  <rect x="170" y="150" width="260" height="40" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="200" y="175" font-family="Arial" font-size="14" fill="#595959">密码：</text>
  <rect x="250" y="155" width="160" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <rect x="170" y="200" width="260" height="60" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="200" y="225" font-family="Arial" font-size="14" fill="#595959">备注：</text>
  <rect x="250" y="205" width="160" height="50" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <rect x="170" y="280" width="260" height="40" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <rect x="250" y="285" width="80" height="30" rx="2" fill="#1890FF" />
  <text x="290" y="305" font-family="Arial" font-size="14" text-anchor="middle" fill="#FFF">提交</text>
  <rect x="340" y="285" width="80" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="380" y="305" font-family="Arial" font-size="14" text-anchor="middle" fill="#595959">取消</text>

  <!-- 右侧属性面板 -->
  <rect x="450" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="460" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="520" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">属性配置</text>

  <!-- 属性面板内容 -->
  <text x="470" y="110" font-family="Arial" font-size="12" fill="#595959">字段标识:</text>
  <rect x="470" y="115" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">username</text>

  <text x="470" y="150" font-family="Arial" font-size="12" fill="#595959">标题文本:</text>
  <rect x="470" y="155" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="170" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">用户名</text>

  <text x="470" y="190" font-family="Arial" font-size="12" fill="#595959">占位提示:</text>
  <rect x="470" y="195" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="210" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">请输入用户名</text>

  <text x="470" y="230" font-family="Arial" font-size="12" fill="#595959">是否必填:</text>
  <rect x="470" y="235" width="16" height="16" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <rect x="473" y="238" width="10" height="10" rx="1" fill="#1890FF" />

  <text x="470" y="270" font-family="Arial" font-size="12" fill="#595959">验证规则:</text>
  <rect x="470" y="275" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="290" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">长度: 3-20</text>

  <text x="470" y="310" font-family="Arial" font-size="12" fill="#595959">默认值:</text>
  <rect x="470" y="315" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
</svg>

#### 组件设计规范

表单设计器中的组件遵循以下设计规范：

1. **视觉一致性**
   - 所有组件使用统一的圆角值(2px)
   - 统一的边框颜色(#D9D9D9)和聚焦状态边框颜色(#1890FF)
   - 统一的内间距(水平12px，垂直8px)

2. **状态表现**
   - 默认状态：白底灰边框
   - 聚焦状态：白底蓝边框
   - 禁用状态：浅灰底灰边框
   - 错误状态：白底红边框
   - 成功状态：白底绿边框

<svg width="600" height="180" xmlns="http://www.w3.org/2000/svg">
  <!-- 默认状态 -->
  <rect x="10" y="10" width="160" height="32" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="20" y="30" font-family="Arial" font-size="12" fill="#595959">默认状态</text>

  <!-- 聚焦状态 -->
  <rect x="10" y="50" width="160" height="32" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <text x="20" y="70" font-family="Arial" font-size="12" fill="#595959">聚焦状态</text>

  <!-- 禁用状态 -->
  <rect x="10" y="90" width="160" height="32" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="20" y="110" font-family="Arial" font-size="12" fill="#BFBFBF">禁用状态</text>

  <!-- 错误状态 -->
  <rect x="10" y="130" width="160" height="32" rx="2" fill="#FFF" stroke="#F5222D" stroke-width="1" />
  <text x="20" y="150" font-family="Arial" font-size="12" fill="#595959">错误状态</text>

  <!-- 成功状态 -->
  <rect x="200" y="10" width="160" height="32" rx="2" fill="#FFF" stroke="#52C41A" stroke-width="1" />
  <text x="210" y="30" font-family="Arial" font-size="12" fill="#595959">成功状态</text>

  <!-- 悬浮状态 -->
  <rect x="200" y="50" width="160" height="32" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" style="filter: drop-shadow(0 0 2px rgba(24,144,255,0.2));" />
  <text x="210" y="70" font-family="Arial" font-size="12" fill="#595959">悬浮状态</text>

  <!-- 只读状态 -->
  <rect x="200" y="90" width="160" height="32" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="210" y="110" font-family="Arial" font-size="12" fill="#595959">只读状态</text>
</svg>

#### 表单组件类型

LowCodeX 平台提供丰富的表单组件类型，满足各种业务场景需求：

1. **输入型组件**
   - 文本输入框
   - 密码输入框
   - 数字输入框
   - 电话号码输入
   - 邮箱输入
   - 多行文本框

2. **选择型组件**
   - 单选框
   - 多选框
   - 下拉选择框
   - 日期选择器
   - 时间选择器
   - 滑块选择器
   - 颜色选择器

3. **上传型组件**
   - 单文件上传
   - 多文件上传
   - 图片上传
   - 头像上传

4. **展示型组件**
   - 文本展示
   - 图片展示
   - 状态标签
   - 进度条
   - 评分组件

5. **布局型组件**
   - 分组框
   - 标签页
   - 步骤条
   - 折叠面板
   - 分割线
   - 卡片容器

### 工作流设计器

工作流设计器是LowCodeX平台的核心功能模块，用于可视化构建业务流程。

#### 整体布局设计

<svg width="600" height="380" xmlns="http://www.w3.org/2000/svg">
  <!-- 整体框架 -->
  <rect x="10" y="10" width="580" height="360" rx="4" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2" />

  <!-- 顶部工具栏 -->
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#1890FF" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">工作流设计器工具栏</text>

  <!-- 左侧节点面板 -->
  <rect x="10" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="80" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">节点库</text>

  <!-- 节点分类 -->
  <rect x="20" y="100" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="117" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">基础节点</text>

  <!-- 节点列表 -->
  <rect x="25" y="130" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="147" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">开始节点</text>

  <rect x="25" y="160" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="177" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">结束节点</text>

  <rect x="25" y="190" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="207" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">任务节点</text>

  <rect x="25" y="220" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="237" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">条件节点</text>

  <rect x="20" y="255" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="272" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">高级节点</text>

  <rect x="25" y="285" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="302" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">子流程节点</text>

  <rect x="25" y="315" width="110" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="332" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">脚本节点</text>

  <!-- 中间设计画布 -->
  <rect x="150" y="50" width="300" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="70" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">流程设计画布</text>

  <!-- 工作流元素 -->
  <!-- 开始节点 -->
  <circle cx="200" cy="130" r="20" fill="#E6F7FF" stroke="#1890FF" stroke-width="1" />
  <text x="200" y="135" font-family="Arial" font-size="12" text-anchor="middle" fill="#1890FF">开始</text>

  <!-- 连接线1 -->
  <line x1="200" y1="150" x2="200" y2="180" stroke="#1890FF" stroke-width="1" />
  <polygon points="196,175 200,185 204,175" fill="#1890FF" />

  <!-- 审批节点 -->
  <rect x="160" y="185" width="80" height="40" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <text x="200" y="210" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">审批节点</text>

  <!-- 连接线2 -->
  <line x1="200" y1="225" x2="200" y2="255" stroke="#1890FF" stroke-width="1" />
  <polygon points="196,250 200,260 204,250" fill="#1890FF" />

  <!-- 条件节点 -->
  <polygon points="200,265 230,285 200,305 170,285" fill="#FFF" stroke="#FAAD14" stroke-width="1" />
  <text x="200" y="290" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">条件</text>

  <!-- 条件分支1 -->
  <line x1="230" y1="285" x2="280" y2="285" stroke="#FAAD14" stroke-width="1" />
  <polygon points="275,281 285,285 275,289" fill="#FAAD14" />
  <text x="255" y="275" font-family="Arial" font-size="10" fill="#8C8C8C">是</text>

  <!-- 条件分支2 -->
  <line x1="170" y1="285" x2="120" y2="285" stroke="#FAAD14" stroke-width="1" transform="translate(0, 70)" />
  <polygon points="125,281 115,285 125,289" fill="#FAAD14" transform="translate(0, 70)" />
  <text x="145" y="345" font-family="Arial" font-size="10" fill="#8C8C8C">否</text>

  <!-- 通过任务 -->
  <rect x="285" y="265" width="80" height="40" rx="2" fill="#FFF" stroke="#52C41A" stroke-width="1" />
  <text x="325" y="290" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">通过任务</text>

  <!-- 拒绝任务 -->
  <rect x="75" y="335" width="80" height="40" rx="2" fill="#FFF" stroke="#F5222D" stroke-width="1" />
  <text x="115" y="360" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">拒绝任务</text>

  <!-- 右侧属性面板 -->
  <rect x="450" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="460" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="520" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">节点属性</text>

  <!-- 属性面板内容 -->
  <text x="470" y="110" font-family="Arial" font-size="12" fill="#595959">节点标识:</text>
  <rect x="470" y="115" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">approval1</text>

  <text x="470" y="150" font-family="Arial" font-size="12" fill="#595959">节点名称:</text>
  <rect x="470" y="155" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="170" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">审批节点</text>

  <text x="470" y="190" font-family="Arial" font-size="12" fill="#595959">审批人:</text>
  <rect x="470" y="195" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="210" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">部门经理</text>

  <text x="470" y="230" font-family="Arial" font-size="12" fill="#595959">审批类型:</text>
  <rect x="470" y="235" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="250" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">单人审批</text>

  <text x="470" y="270" font-family="Arial" font-size="12" fill="#595959">超时设置:</text>
  <rect x="470" y="275" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="290" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">24小时</text>

  <text x="470" y="310" font-family="Arial" font-size="12" fill="#595959">表单关联:</text>
  <rect x="470" y="315" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="330" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">审批表单</text>
</svg>

#### 节点设计规范

工作流设计器中的节点遵循以下设计规范：

1. **形状与色彩**
   - 开始/结束节点：圆形，蓝色边框
   - 任务节点：矩形，蓝色边框
   - 审批节点：矩形，绿色边框
   - 条件节点：菱形，橙色边框
   - 自动节点：矩形，紫色边框
   - 错误处理节点：矩形，红色边框

2. **连接线规范**
   - 标准连接线：实线箭头
   - 条件分支：虚线箭头，附带条件标签
   - 默认路径：点划线箭头
   - 箭头颜色与起始节点边框颜色保持一致

<svg width="600" height="180" xmlns="http://www.w3.org/2000/svg">
  <!-- 开始节点 -->
  <circle cx="40" cy="30" r="20" fill="#E6F7FF" stroke="#1890FF" stroke-width="1.5" />
  <text x="40" y="35" font-family="Arial" font-size="12" text-anchor="middle" fill="#1890FF">开始</text>

  <!-- 任务节点 -->
  <rect x="10" y="70" width="60" height="35" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1.5" />
  <text x="40" y="92" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">任务</text>

  <!-- 审批节点 -->
  <rect x="10" y="120" width="60" height="35" rx="2" fill="#FFF" stroke="#52C41A" stroke-width="1.5" />
  <text x="40" y="142" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">审批</text>

  <!-- 条件节点 -->
  <polygon points="140,30 160,50 140,70 120,50" fill="#FFF" stroke="#FAAD14" stroke-width="1.5" />
  <text x="140" y="54" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">条件</text>

  <!-- 自动节点 -->
  <rect x="110" y="90" width="60" height="35" rx="2" fill="#FFF" stroke="#722ED1" stroke-width="1.5" />
  <text x="140" y="112" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">自动</text>

  <!-- 错误处理节点 -->
  <rect x="110" y="140" width="60" height="35" rx="2" fill="#FFF" stroke="#F5222D" stroke-width="1.5" />
  <text x="140" y="162" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">错误</text>

  <!-- 结束节点 -->
  <circle cx="240" cy="30" r="20" fill="#FFF" stroke="#1890FF" stroke-width="1.5" />
  <text x="240" y="35" font-family="Arial" font-size="12" text-anchor="middle" fill="#1890FF">结束</text>

  <!-- 标准连接线 -->
  <line x1="220" y1="70" x2="280" y2="70" stroke="#1890FF" stroke-width="1.5" />
  <polygon points="275,66 285,70 275,74" fill="#1890FF" />
  <text x="250" y="65" font-family="Arial" font-size="10" fill="#8C8C8C">标准连接线</text>

  <!-- 条件连接线 -->
  <line x1="220" y1="110" x2="280" y2="110" stroke="#FAAD14" stroke-width="1.5" stroke-dasharray="5,2" />
  <polygon points="275,106 285,110 275,114" fill="#FAAD14" />
  <text x="250" y="105" font-family="Arial" font-size="10" fill="#8C8C8C">条件连接线</text>

  <!-- 默认路径 -->
  <line x1="220" y1="150" x2="280" y2="150" stroke="#1890FF" stroke-width="1.5" stroke-dasharray="10,2,2,2" />
  <polygon points="275,146 285,150 275,154" fill="#1890FF" />
  <text x="250" y="145" font-family="Arial" font-size="10" fill="#8C8C8C">默认路径</text>
</svg>

#### 工作流组件类型

LowCodeX 平台工作流设计器支持丰富的节点类型，满足各类业务流程需求：

1. **基础节点**
   - 开始节点
   - 结束节点
   - 任务节点
   - 审批节点
   - 条件节点
   - 并行网关
   - 会签节点

2. **高级节点**
   - 子流程节点
   - 定时触发节点
   - 消息触发节点
   - 脚本节点
   - 服务调用节点
   - 数据操作节点
   - 人工干预节点

3. **特殊节点**
   - 等待节点
   - 异常处理节点
   - 取消节点
   - 挂起节点
   - 重试节点

### 数据模型设计器

数据模型设计器是LowCodeX平台的基础功能模块，用于可视化定义业务数据结构。

#### 整体布局设计

<svg width="600" height="380" xmlns="http://www.w3.org/2000/svg">
  <!-- 整体框架 -->
  <rect x="10" y="10" width="580" height="360" rx="4" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2" />

  <!-- 顶部工具栏 -->
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#1890FF" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">数据模型设计器工具栏</text>

  <!-- 左侧实体列表面板 -->
  <rect x="10" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="80" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">实体列表</text>

  <!-- 搜索框 -->
  <rect x="20" y="100" width="120" height="25" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="40" y="117" font-family="Arial" font-size="10" fill="#BFBFBF">搜索...</text>

  <!-- 实体列表 -->
  <rect x="20" y="135" width="120" height="30" rx="2" fill="#E6F7FF" stroke="#1890FF" stroke-width="1" />
  <text x="80" y="155" font-family="Arial" font-size="12" text-anchor="middle" fill="#1890FF">用户</text>

  <rect x="20" y="170" width="120" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">部门</text>

  <rect x="20" y="205" width="120" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="225" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">角色</text>

  <rect x="20" y="240" width="120" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="260" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">权限</text>

  <rect x="20" y="275" width="120" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="295" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">菜单</text>

  <rect x="20" y="310" width="120" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="330" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">日志</text>

  <!-- 中间字段列表面板 -->
  <rect x="150" y="50" width="300" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="160" y="60" width="280" height="30" rx="2" fill="#E6F7FF" />
  <text x="300" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">用户 - 字段定义</text>

  <!-- 字段列表表头 -->
  <rect x="160" y="100" width="280" height="30" rx="0" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="120" font-family="Arial" font-size="12" fill="#595959">字段名</text>
  <text x="260" y="120" font-family="Arial" font-size="12" fill="#595959">类型</text>
  <text x="330" y="120" font-family="Arial" font-size="12" fill="#595959">必填</text>
  <text x="380" y="120" font-family="Arial" font-size="12" fill="#595959">操作</text>
  <line x1="220" y1="100" x2="220" y2="130" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="100" x2="300" y2="130" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="100" x2="360" y2="130" stroke="#EAEAEA" stroke-width="1" />

  <!-- 字段列表 -->
  <rect x="160" y="130" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="150" font-family="Arial" font-size="12" fill="#595959">id</text>
  <text x="260" y="150" font-family="Arial" font-size="12" fill="#595959">ID</text>
  <text x="330" y="150" font-family="Arial" font-size="12" fill="#52C41A">✓</text>
  <text x="380" y="150" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="130" x2="220" y2="160" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="130" x2="300" y2="160" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="130" x2="360" y2="160" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="160" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="180" font-family="Arial" font-size="12" fill="#595959">username</text>
  <text x="260" y="180" font-family="Arial" font-size="12" fill="#595959">文本</text>
  <text x="330" y="180" font-family="Arial" font-size="12" fill="#52C41A">✓</text>
  <text x="380" y="180" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="160" x2="220" y2="190" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="160" x2="300" y2="190" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="160" x2="360" y2="190" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="190" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="210" font-family="Arial" font-size="12" fill="#595959">password</text>
  <text x="260" y="210" font-family="Arial" font-size="12" fill="#595959">密码</text>
  <text x="330" y="210" font-family="Arial" font-size="12" fill="#52C41A">✓</text>
  <text x="380" y="210" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="190" x2="220" y2="220" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="190" x2="300" y2="220" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="190" x2="360" y2="220" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="220" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="240" font-family="Arial" font-size="12" fill="#595959">email</text>
  <text x="260" y="240" font-family="Arial" font-size="12" fill="#595959">邮件</text>
  <text x="330" y="240" font-family="Arial" font-size="12" fill="#52C41A">✓</text>
  <text x="380" y="240" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="220" x2="220" y2="250" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="220" x2="300" y2="250" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="220" x2="360" y2="250" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="250" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="270" font-family="Arial" font-size="12" fill="#595959">phone</text>
  <text x="260" y="270" font-family="Arial" font-size="12" fill="#595959">电话</text>
  <text x="330" y="270" font-family="Arial" font-size="12" fill="#BFBFBF">✗</text>
  <text x="380" y="270" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="250" x2="220" y2="280" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="250" x2="300" y2="280" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="250" x2="360" y2="280" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="280" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="300" font-family="Arial" font-size="12" fill="#595959">status</text>
  <text x="260" y="300" font-family="Arial" font-size="12" fill="#595959">枚举</text>
  <text x="330" y="300" font-family="Arial" font-size="12" fill="#52C41A">✓</text>
  <text x="380" y="300" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="280" x2="220" y2="310" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="280" x2="300" y2="310" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="280" x2="360" y2="310" stroke="#EAEAEA" stroke-width="1" />

  <rect x="160" y="310" width="280" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="180" y="330" font-family="Arial" font-size="12" fill="#595959">dept_id</text>
  <text x="260" y="330" font-family="Arial" font-size="12" fill="#595959">关联</text>
  <text x="330" y="330" font-family="Arial" font-size="12" fill="#BFBFBF">✗</text>
  <text x="380" y="330" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="220" y1="310" x2="220" y2="340" stroke="#EAEAEA" stroke-width="1" />
  <line x1="300" y1="310" x2="300" y2="340" stroke="#EAEAEA" stroke-width="1" />
  <line x1="360" y1="310" x2="360" y2="340" stroke="#EAEAEA" stroke-width="1" />

  <!-- 右侧属性面板 -->
  <rect x="450" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="460" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="520" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">字段属性</text>

  <!-- 属性面板内容 -->
  <text x="470" y="110" font-family="Arial" font-size="12" fill="#595959">字段名:</text>
  <rect x="470" y="115" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">username</text>

  <text x="470" y="150" font-family="Arial" font-size="12" fill="#595959">显示名:</text>
  <rect x="470" y="155" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="170" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">用户名</text>

  <text x="470" y="190" font-family="Arial" font-size="12" fill="#595959">数据类型:</text>
  <rect x="470" y="195" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="210" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">文本</text>

  <text x="470" y="230" font-family="Arial" font-size="12" fill="#595959">是否必填:</text>
  <rect x="470" y="235" width="16" height="16" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <rect x="473" y="238" width="10" height="10" rx="1" fill="#1890FF" />

  <text x="470" y="270" font-family="Arial" font-size="12" fill="#595959">长度限制:</text>
  <rect x="470" y="275" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="290" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">3-20</text>

  <text x="470" y="310" font-family="Arial" font-size="12" fill="#595959">默认值:</text>
  <rect x="470" y="315" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
</svg>

#### 数据模型组件设计规范

数据模型设计器的UI组件遵循以下设计规范：

1. **实体节点**
   - 标准卡片样式，圆角为2px
   - 实体名称使用加粗字体
   - 实体类型通过不同的边框颜色区分
   - 系统实体：蓝色边框
   - 业务实体：绿色边框
   - 关联实体：橙色边框

2. **字段列表**
   - 表格式布局，清晰展示字段信息
   - 主键字段名称加粗显示
   - 必填字段使用绿色勾标识
   - 非必填字段使用灰色叉标识
   - 关联字段名称使用斜体显示

3. **关系连接线**
   - 一对一关系：实线连接，双箭头
   - 一对多关系：实线连接，单箭头
   - 多对多关系：虚线连接，双箭头
   - 关系类型通过连接线颜色区分

### 页面设计器

页面设计器是LowCodeX平台的高级功能模块，用于可视化构建应用界面。

#### 整体布局设计

<svg width="600" height="380" xmlns="http://www.w3.org/2000/svg">
  <!-- 整体框架 -->
  <rect x="10" y="10" width="580" height="360" rx="4" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2" />

  <!-- 顶部工具栏 -->
  <rect x="10" y="10" width="580" height="40" rx="4" fill="#1890FF" />
  <text x="300" y="35" font-family="Arial" font-size="16" text-anchor="middle" fill="white">页面设计器工具栏</text>

  <!-- 左侧组件面板 -->
  <rect x="10" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="80" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">页面组件</text>

  <!-- 组件分类 -->
  <rect x="20" y="100" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="117" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">布局组件</text>

  <!-- 组件列表 -->
  <rect x="25" y="130" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="145" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">栅格行</text>

  <rect x="25" y="157" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="172" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">卡片</text>

  <rect x="25" y="184" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="199" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">标签页</text>

  <rect x="20" y="215" width="120" height="25" rx="2" fill="#F5F5F5" />
  <text x="80" y="232" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">数据组件</text>

  <rect x="25" y="245" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="260" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">表格</text>

  <rect x="25" y="272" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="287" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">列表</text>

  <rect x="25" y="299" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="314" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">图表</text>

  <rect x="25" y="326" width="110" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="341" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">表单</text>

  <!-- 中间设计画布 -->
  <rect x="150" y="50" width="300" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="75" font-family="Arial" font-size="16" text-anchor="middle" fill="#595959">页面设计画布</text>

  <!-- 页面元素 -->
  <!-- 页面标题 -->
  <rect x="165" y="95" width="270" height="40" rx="0" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="190" y="120" font-family="Arial" font-size="16" fill="#262626">用户管理</text>

  <!-- 搜索区域 -->
  <rect x="165" y="145" width="270" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="190" y="165" font-family="Arial" font-size="12" fill="#595959">用户名:</text>
  <rect x="240" y="150" width="120" height="24" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="370" y="150" width="50" height="24" rx="2" fill="#1890FF" />
  <text x="395" y="165" font-family="Arial" font-size="12" text-anchor="middle" fill="#FFF">搜索</text>

  <text x="190" y="195" font-family="Arial" font-size="12" fill="#595959">状态:</text>
  <rect x="240" y="180" width="120" height="24" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <!-- 表格区域 -->
  <rect x="165" y="215" width="270" height="145" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <!-- 表格头 -->
  <rect x="165" y="215" width="270" height="30" rx="0" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="185" y="235" font-family="Arial" font-size="12" fill="#595959">用户名</text>
  <text x="255" y="235" font-family="Arial" font-size="12" fill="#595959">邮箱</text>
  <text x="325" y="235" font-family="Arial" font-size="12" fill="#595959">状态</text>
  <text x="385" y="235" font-family="Arial" font-size="12" fill="#595959">操作</text>
  <line x1="225" y1="215" x2="225" y2="245" stroke="#EAEAEA" stroke-width="1" />
  <line x1="295" y1="215" x2="295" y2="245" stroke="#EAEAEA" stroke-width="1" />
  <line x1="365" y1="215" x2="365" y2="245" stroke="#EAEAEA" stroke-width="1" />

  <!-- 表格行1 -->
  <rect x="165" y="245" width="270" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="185" y="265" font-family="Arial" font-size="12" fill="#595959">admin</text>
  <text x="255" y="265" font-family="Arial" font-size="12" fill="#595959">admin@example.com</text>
  <text x="325" y="265" font-family="Arial" font-size="12" fill="#52C41A">正常</text>
  <text x="385" y="265" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="225" y1="245" x2="225" y2="275" stroke="#EAEAEA" stroke-width="1" />
  <line x1="295" y1="245" x2="295" y2="275" stroke="#EAEAEA" stroke-width="1" />
  <line x1="365" y1="245" x2="365" y2="275" stroke="#EAEAEA" stroke-width="1" />

  <!-- 表格行2 -->
  <rect x="165" y="275" width="270" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="185" y="295" font-family="Arial" font-size="12" fill="#595959">user1</text>
  <text x="255" y="295" font-family="Arial" font-size="12" fill="#595959">user1@example.com</text>
  <text x="325" y="295" font-family="Arial" font-size="12" fill="#F5222D">禁用</text>
  <text x="385" y="295" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="225" y1="275" x2="225" y2="305" stroke="#EAEAEA" stroke-width="1" />
  <line x1="295" y1="275" x2="295" y2="305" stroke="#EAEAEA" stroke-width="1" />
  <line x1="365" y1="275" x2="365" y2="305" stroke="#EAEAEA" stroke-width="1" />

  <!-- 表格行3 -->
  <rect x="165" y="305" width="270" height="30" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="185" y="325" font-family="Arial" font-size="12" fill="#595959">user2</text>
  <text x="255" y="325" font-family="Arial" font-size="12" fill="#595959">user2@example.com</text>
  <text x="325" y="325" font-family="Arial" font-size="12" fill="#52C41A">正常</text>
  <text x="385" y="325" font-family="Arial" font-size="12" fill="#1890FF">编辑</text>
  <line x1="225" y1="305" x2="225" y2="335" stroke="#EAEAEA" stroke-width="1" />
  <line x1="295" y1="305" x2="295" y2="335" stroke="#EAEAEA" stroke-width="1" />
  <line x1="365" y1="305" x2="365" y2="335" stroke="#EAEAEA" stroke-width="1" />

  <!-- 分页 -->
  <rect x="265" y="330" width="70" height="25" rx="0" fill="#FFF" />
  <text x="300" y="347" font-family="Arial" font-size="12" text-anchor="middle" fill="#8C8C8C">1/10</text>

  <!-- 右侧属性面板 -->
  <rect x="450" y="50" width="140" height="320" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="460" y="60" width="120" height="30" rx="2" fill="#E6F7FF" />
  <text x="520" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#1890FF">组件属性</text>

  <!-- 属性面板内容 -->
  <text x="470" y="110" font-family="Arial" font-size="12" fill="#595959">组件类型:</text>
  <rect x="470" y="115" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">表格</text>

  <text x="470" y="150" font-family="Arial" font-size="12" fill="#595959">数据源:</text>
  <rect x="470" y="155" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="170" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">用户列表</text>

  <text x="470" y="190" font-family="Arial" font-size="12" fill="#595959">显示列:</text>
  <rect x="470" y="195" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="210" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">4列</text>

  <text x="470" y="230" font-family="Arial" font-size="12" fill="#595959">分页大小:</text>
  <rect x="470" y="235" width="100" height="22" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="520" y="250" font-family="Arial" font-size="10" text-anchor="middle" fill="#8C8C8C">10</text>

  <text x="470" y="270" font-family="Arial" font-size="12" fill="#595959">可选择:</text>
  <rect x="470" y="275" width="16" height="16" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <text x="470" y="310" font-family="Arial" font-size="12" fill="#595959">边框:</text>
  <rect x="470" y="315" width="16" height="16" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <rect x="473" y="318" width="10" height="10" rx="1" fill="#1890FF" />
</svg>

#### 页面组件设计规范

页面设计器中的组件遵循以下设计规范：

1. **布局组件**
   - 栅格行列系统：24列栅格布局
   - 卡片容器：白色背景，浅灰色边框
   - 分组容器：带标题栏的容器
   - 标签页容器：多内容区切换
   - 折叠面板：可展开收起的内容区

2. **数据展示组件**
   - 表格：标准数据表格，支持排序、筛选
   - 列表：多种风格的列表组件
   - 描述列表：键值对形式的数据展示
   - 统计卡片：数据指标展示

3. **表单组件**
   - 搜索框：集成在页面顶部
   - 表单容器：集成表单设计器的表单
   - 筛选表单：用于数据过滤的表单

<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">
  <!-- 栅格系统 -->
  <rect x="20" y="20" width="270" height="60" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <line x1="110" y1="20" x2="110" y2="80" stroke="#D9D9D9" stroke-width="1" stroke-dasharray="5,5" />
  <line x1="200" y1="20" x2="200" y2="80" stroke="#D9D9D9" stroke-width="1" stroke-dasharray="5,5" />
  <text x="60" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">Col-8</text>
  <text x="155" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">Col-8</text>
  <text x="240" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">Col-8</text>

  <!-- 卡片组件 -->
  <rect x="20" y="100" width="120" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="20" y="100" width="120" height="30" rx="2" fill="#FAFAFA" />
  <text x="80" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#262626">卡片标题</text>
  <line x1="30" y1="150" x2="130" y2="150" stroke="#F0F0F0" stroke-width="1" />
  <text x="80" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">卡片内容</text>

  <!-- 标签页组件 -->
  <rect x="170" y="100" width="120" height="100" rx="0" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="170" y="100" width="60" height="30" rx="0" fill="#FFF" stroke="none" />
  <line x1="170" y1="130" x2="230" y2="130" stroke="#1890FF" stroke-width="2" />
  <text x="200" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#1890FF">标签一</text>
  <rect x="230" y="100" width="60" height="30" rx="0" fill="#FFF" stroke="none" />
  <text x="260" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">标签二</text>
  <line x1="170" y1="130" x2="290" y2="130" stroke="#F0F0F0" stroke-width="1" />
  <text x="230" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">标签页内容</text>
</svg>

#### 页面布局类型

LowCodeX 平台支持多种页面布局类型，满足不同场景需求：

1. **列表页布局**
   - 顶部搜索区
   - 表格或列表主体
   - 底部分页区
   - 常用于数据浏览和管理

2. **详情页布局**
   - 顶部基本信息
   - 标签页分隔多部分内容
   - 底部操作按钮区
   - 常用于数据详情展示

3. **表单页布局**
   - 单列或多列表单布局
   - 分步表单布局
   - 表单验证与联动
   - 常用于数据录入和编辑

4. **仪表盘布局**
   - 多卡片网格布局
   - 统计数据与图表展示
   - 数据筛选与联动
   - 常用于数据分析和监控

## 响应式设计

LowCodeX 平台采用响应式设计方案，确保应用在不同尺寸的设备上都能提供良好的用户体验。

### 断点设计

<svg width="600" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="70" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="45" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">XS<tspan x="45" y="55">＜576px</tspan></text>

  <rect x="90" y="10" width="90" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="135" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">SM<tspan x="135" y="55">≥576px</tspan></text>

  <rect x="190" y="10" width="90" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="235" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">MD<tspan x="235" y="55">≥768px</tspan></text>

  <rect x="290" y="10" width="90" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="335" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">LG<tspan x="335" y="55">≥992px</tspan></text>

  <rect x="390" y="10" width="90" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="435" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">XL<tspan x="435" y="55">≥1200px</tspan></text>

  <rect x="490" y="10" width="100" height="60" rx="2" fill="#F5F5F5" stroke="#D9D9D9" stroke-width="1" />
  <text x="540" y="40" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">XXL<tspan x="540" y="55">≥1600px</tspan></text>
</svg>

### 响应式布局策略

1. **栅格系统适配**
   - 使用24列栅格系统，可根据屏幕尺寸调整列宽
   - 不同断点下设置不同列数和间距
   - 较小屏幕下列自动堆叠为单列布局

2. **组件响应式行为**
   - 表格组件在小屏下自动隐藏非关键列
   - 导航菜单在小屏下转为抽屉式菜单
   - 表单项在小屏下转为单列布局

3. **容器自适应**
   - 固定宽度容器在不同断点下有不同的最大宽度
   - 流式容器随屏幕宽度变化，两侧保持固定边距
   - 内容区域优先保证核心功能可用

<svg width="600" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 大屏布局 -->
  <rect x="10" y="10" width="580" height="100" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">大屏布局</text>

  <rect x="20" y="40" width="120" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">导航菜单</text>

  <rect x="150" y="40" width="250" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="275" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">主内容区</text>

  <rect x="410" y="40" width="170" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="495" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">详情面板</text>

  <!-- 平板布局 -->
  <rect x="10" y="130" width="580" height="100" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">平板布局</text>

  <rect x="20" y="160" width="80" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="60" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">导航</text>

  <rect x="110" y="160" width="230" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="225" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">主内容区</text>

  <rect x="350" y="160" width="230" height="60" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="465" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">详情面板</text>
</svg>

### 移动端适配

为确保在移动端设备上的良好体验，LowCodeX 平台特别优化了以下方面：

1. **触控友好设计**
   - 增大点击区域，确保易于触碰
   - 简化操作流程，减少输入需求
   - 提供下拉刷新和滑动加载更多功能

2. **移动端专用视图**
   - 针对小屏设备的简化视图
   - 重点突出核心功能
   - 优化导航和操作方式

3. **性能优化**
   - 减少不必要的请求和资源加载
   - 优化渲染性能
   - 减少动画和过渡效果

## 交互设计

LowCodeX 平台注重优秀的交互体验，为用户提供直观、高效的操作方式。

### 拖拽交互

拖拽是低代码平台的核心交互方式，LowCodeX 平台实现了多种拖拽交互：

1. **组件拖拽**
   - 从组件面板拖拽到设计画布
   - 在画布内拖拽调整位置
   - 拖拽时显示对齐辅助线和放置提示

2. **连线拖拽**
   - 节点间连线创建
   - 线条控制点调整
   - 拖拽过程中显示可连接提示

3. **调整大小**
   - 通过边框控制点调整组件大小
   - 拖拽时显示尺寸提示
   - 支持按比例缩放

<svg width="600" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 拖拽交互示意 -->
  <rect x="10" y="10" width="180" height="180" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="100" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">组件拖拽</text>

  <!-- 组件面板 -->
  <rect x="20" y="40" width="70" height="140" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="30" y="50" width="50" height="25" rx="2" fill="#F0F5FF" stroke="#D9D9D9" stroke-width="1" />
  <text x="55" y="65" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">按钮</text>

  <rect x="30" y="85" width="50" height="25" rx="2" fill="#F0F5FF" stroke="#D9D9D9" stroke-width="1" />
  <text x="55" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">输入框</text>

  <!-- 拖拽中的组件 -->
  <rect x="80" y="70" width="50" height="25" rx="2" fill="#1890FF" stroke="#096DD9" stroke-width="1" opacity="0.5" />
  <text x="105" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#FFF">按钮</text>

  <!-- 拖拽路径 -->
  <line x1="55" y1="60" x2="105" y2="85" stroke="#1890FF" stroke-width="1" stroke-dasharray="5,5" />

  <!-- 放置目标区域 -->
  <rect x="100" y="40" width="80" height="140" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" stroke-dasharray="5,5" />

  <!-- 连线拖拽示意 -->
  <rect x="210" y="10" width="180" height="180" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">连线拖拽</text>

  <!-- 起始节点 -->
  <rect x="230" y="80" width="50" height="30" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" />
  <text x="255" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">开始</text>

  <!-- 目标节点 -->
  <rect x="330" y="80" width="50" height="30" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="355" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">结束</text>

  <!-- 连线和拖拽点 -->
  <line x1="280" y1="95" x2="320" y2="95" stroke="#1890FF" stroke-width="1" stroke-dasharray="5,5" />
  <circle cx="330" cy="95" r="5" fill="#1890FF" />

  <!-- 大小调整示意 -->
  <rect x="410" y="10" width="180" height="180" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="500" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">大小调整</text>

  <!-- 被调整大小的组件 -->
  <rect x="440" y="60" width="100" height="80" rx="2" fill="#FFF" stroke="#1890FF" stroke-width="1" stroke-dasharray="2,2" />
  <rect x="450" y="70" width="80" height="60" rx="2" fill="#F0F5FF" stroke="#D9D9D9" stroke-width="1" />
  <text x="490" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">表单</text>

  <!-- 调整控制点 -->
  <rect x="440" y="60" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="487" y="60" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="540" y="60" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="440" y="97" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="540" y="97" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="440" y="140" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="487" y="140" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />
  <rect x="540" y="140" width="6" height="6" rx="0" fill="#1890FF" stroke="none" />

  <!-- 尺寸提示 -->
  <rect x="470" y="150" width="40" height="20" rx="2" fill="#262626" opacity="0.8" />
  <text x="490" y="164" font-family="Arial" font-size="10" text-anchor="middle" fill="#FFF">100x80</text>
</svg>

### 快捷操作

为提高开发效率，平台设计了丰富的快捷操作：

1. **键盘快捷键**
   - Ctrl+C/Ctrl+V：复制/粘贴组件
   - Delete：删除选中组件
   - Ctrl+Z/Ctrl+Y：撤销/重做操作
   - Ctrl+S：保存设计
   - Esc：取消当前操作/选择

2. **右键菜单**
   - 提供上下文相关的操作选项
   - 快速访问常用功能
   - 显示组件特定的高级选项

3. **双击编辑**
   - 双击文本直接编辑
   - 双击组件打开详细配置
   - 双击空白区域创建新组件

### 状态反馈

良好的状态反馈帮助用户理解系统状态和操作结果：

1. **视觉反馈**
   - 点击效果：按钮按下状态
   - 悬停效果：鼠标悬停高亮
   - 加载状态：操作进行中的加载指示
   - 成功/失败状态：操作结果的视觉提示

2. **消息通知**
   - 轻量级提示：操作成功的简短提示
   - 警告提示：需要注意的操作
   - 错误提示：操作失败的详细信息
   - 确认对话框：重要操作的二次确认

<svg width="600" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 视觉反馈示例 -->
  <rect x="10" y="10" width="280" height="180" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="150" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">视觉反馈</text>

  <!-- 正常状态 -->
  <rect x="30" y="50" width="100" height="32" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="80" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#595959">正常状态</text>

  <!-- 悬停状态 -->
  <rect x="30" y="100" width="100" height="32" rx="2" fill="#FFF" stroke="#40A9FF" stroke-width="1" />
  <text x="80" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#40A9FF">悬停状态</text>

  <!-- 点击状态 -->
  <rect x="170" y="50" width="100" height="32" rx="2" fill="#1890FF" stroke="#096DD9" stroke-width="1" />
  <text x="220" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#FFF">点击状态</text>

  <!-- 加载状态 -->
  <rect x="170" y="100" width="100" height="32" rx="2" fill="#1890FF" stroke="#096DD9" stroke-width="1" />
  <text x="200" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#FFF">加载中</text>
  <circle cx="240" cy="116" r="8" fill="none" stroke="#FFF" stroke-width="2">
    <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 240 116" to="360 240 116" dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- 消息通知示例 -->
  <rect x="310" y="10" width="280" height="180" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />
  <text x="450" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">消息通知</text>

  <!-- 成功提示 -->
  <rect x="330" y="50" width="240" height="32" rx="2" fill="#F6FFED" stroke="#B7EB8F" stroke-width="1" />
  <circle cx="345" cy="66" r="8" fill="#52C41A" />
  <text x="450" y="70" font-family="Arial" font-size="12" text-anchor="middle" fill="#52C41A">操作成功</text>

  <!-- 警告提示 -->
  <rect x="330" y="90" width="240" height="32" rx="2" fill="#FFFBE6" stroke="#FFE58F" stroke-width="1" />
  <circle cx="345" cy="106" r="8" fill="#FAAD14" />
  <text x="450" y="110" font-family="Arial" font-size="12" text-anchor="middle" fill="#FAAD14">请注意可能的问题</text>

  <!-- 错误提示 -->
  <rect x="330" y="130" width="240" height="32" rx="2" fill="#FFF1F0" stroke="#FFA39E" stroke-width="1" />
  <circle cx="345" cy="146" r="8" fill="#F5222D" />
  <text x="450" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="#F5222D">操作失败，请重试</text>
</svg>

## 主题系统

LowCodeX 平台的主题系统支持灵活的视觉定制，满足不同企业的品牌需求。

### 基础主题设置

平台提供默认的明暗主题，并支持企业定制主要品牌色：

1. **明暗主题切换**
   - 明亮主题：白色背景，深色文本
   - 暗色主题：深色背景，浅色文本

2. **主色调定制**
   - 品牌主色定制
   - 自动生成色彩梯度
   - 预设多种配色方案

<svg width="600" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 明亮主题示例 -->
  <rect x="10" y="10" width="280" height="180" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="150" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">明亮主题</text>

  <!-- 导航栏 -->
  <rect x="10" y="10" width="280" height="40" rx="2" fill="#FFF" stroke="#F0F0F0" stroke-width="1" />
  <text x="35" y="35" font-family="Arial" font-size="12" fill="#1890FF">LowCodeX</text>

  <!-- 侧边栏 -->
  <rect x="10" y="50" width="70" height="140" rx="0" fill="#F0F0F0" stroke="none" />

  <!-- 菜单项 -->
  <rect x="15" y="70" width="60" height="30" rx="2" fill="#E6F7FF" stroke="none" />
  <text x="45" y="90" font-family="Arial" font-size="10" text-anchor="middle" fill="#1890FF">仪表盘</text>

  <rect x="15" y="110" width="60" height="30" rx="2" fill="#F0F0F0" stroke="none" />
  <text x="45" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#595959">表单</text>

  <!-- 内容区 -->
  <rect x="80" y="50" width="210" height="140" rx="0" fill="#FFF" stroke="none" />
  <text x="100" y="70" font-family="Arial" font-size="12" fill="#262626">欢迎使用</text>

  <rect x="100" y="80" width="180" height="90" rx="2" fill="#FAFAFA" stroke="#F0F0F0" stroke-width="1" />

  <!-- 暗色主题示例 -->
  <rect x="310" y="10" width="280" height="180" rx="2" fill="#141414" stroke="#303030" stroke-width="1" />
  <text x="450" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#FFF">暗色主题</text>

  <!-- 导航栏 -->
  <rect x="310" y="10" width="280" height="40" rx="2" fill="#1F1F1F" stroke="none" />
  <text x="335" y="35" font-family="Arial" font-size="12" fill="#1890FF">LowCodeX</text>

  <!-- 侧边栏 -->
  <rect x="310" y="50" width="70" height="140" rx="0" fill="#141414" stroke="none" />

  <!-- 菜单项 -->
  <rect x="315" y="70" width="60" height="30" rx="2" fill="#111B26" stroke="none" />
  <text x="345" y="90" font-family="Arial" font-size="10" text-anchor="middle" fill="#1890FF">仪表盘</text>

  <rect x="315" y="110" width="60" height="30" rx="2" fill="#141414" stroke="none" />
  <text x="345" y="130" font-family="Arial" font-size="10" text-anchor="middle" fill="#FFFFFF">表单</text>

  <!-- 内容区 -->
  <rect x="380" y="50" width="210" height="140" rx="0" fill="#1F1F1F" stroke="none" />
  <text x="400" y="70" font-family="Arial" font-size="12" fill="#FFFFFF">欢迎使用</text>

  <rect x="400" y="80" width="180" height="90" rx="2" fill="#141414" stroke="#303030" stroke-width="1" />
</svg>

### 主题变量系统

平台使用CSS变量实现主题系统，支持深度定制：

1. **全局变量**
   - 主色
   - 成功色
   - 警告色
   - 错误色
   - 背景色
   - 文本色
   - 边框色
   - 阴影效果

2. **组件级变量**
   - 按钮样式
   - 表单元素样式
   - 卡片样式
   - 表格样式
   - 导航样式

### 主题定制器

平台提供可视化主题定制工具，方便企业客户快速定制专属主题：

1. **颜色选择器**
   - 主色调选择
   - 自动生成色阶
   - 颜色对比度检查

2. **预览功能**
   - 实时预览效果
   - 多场景预览
   - 暗色模式预览

3. **主题导出**
   - 导出为CSS变量
   - 导出为配置文件
   - 一键应用到应用

<svg width="600" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 主题定制器 -->
  <rect x="10" y="10" width="580" height="230" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="300" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#262626">主题定制器</text>

  <!-- 左侧设置面板 -->
  <rect x="20" y="40" width="200" height="190" rx="2" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="1" />

  <!-- 颜色选择器 -->
  <text x="120" y="60" font-family="Arial" font-size="12" text-anchor="middle" fill="#262626">主题色配置</text>

  <text x="40" y="80" font-family="Arial" font-size="10" fill="#595959">主色调:</text>
  <rect x="90" y="70" width="120" height="20" rx="2" fill="#1890FF" stroke="none" />

  <text x="40" y="110" font-family="Arial" font-size="10" fill="#595959">成功色:</text>
  <rect x="90" y="100" width="120" height="20" rx="2" fill="#52C41A" stroke="none" />

  <text x="40" y="140" font-family="Arial" font-size="10" fill="#595959">警告色:</text>
  <rect x="90" y="130" width="120" height="20" rx="2" fill="#FAAD14" stroke="none" />

  <text x="40" y="170" font-family="Arial" font-size="10" fill="#595959">错误色:</text>
  <rect x="90" y="160" width="120" height="20" rx="2" fill="#F5222D" stroke="none" />

  <text x="40" y="200" font-family="Arial" font-size="10" fill="#595959">背景色:</text>
  <rect x="90" y="190" width="120" height="20" rx="2" fill="#F0F2F5" stroke="none" />

  <!-- 右侧预览区域 -->
  <rect x="240" y="40" width="340" height="190" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <text x="410" y="60" font-family="Arial" font-size="12" text-anchor="middle" fill="#262626">主题预览</text>

  <!-- 预览界面 -->
  <!-- 导航栏 -->
  <rect x="250" y="70" width="320" height="30" rx="0" fill="#1890FF" stroke="none" />
  <text x="280" y="90" font-family="Arial" font-size="10" fill="#FFF">LowCodeX</text>

  <!-- 内容区 -->
  <rect x="250" y="100" width="320" height="120" rx="0" fill="#F0F2F5" stroke="none" />

  <!-- 卡片1 -->
  <rect x="260" y="110" width="140" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />
  <rect x="270" y="120" width="120" height="20" rx="2" fill="#FAFAFA" stroke="none" />
  <text x="280" y="135" font-family="Arial" font-size="10" fill="#262626">标题</text>

  <!-- 按钮 -->
  <rect x="270" y="150" width="60" height="24" rx="2" fill="#1890FF" stroke="none" />
  <text x="300" y="166" font-family="Arial" font-size="10" text-anchor="middle" fill="#FFF">按钮</text>

  <!-- 成功状态 -->
  <rect x="270" y="180" width="120" height="20" rx="2" fill="#F6FFED" stroke="#B7EB8F" stroke-width="1" />
  <text x="330" y="195" font-family="Arial" font-size="10" text-anchor="middle" fill="#52C41A">成功状态</text>

  <!-- 卡片2 -->
  <rect x="420" y="110" width="140" height="100" rx="2" fill="#FFF" stroke="#D9D9D9" stroke-width="1" />

  <!-- 警告状态 -->
  <rect x="430" y="120" width="120" height="20" rx="2" fill="#FFFBE6" stroke="#FFE58F" stroke-width="1" />
  <text x="490" y="135" font-family="Arial" font-size="10" text-anchor="middle" fill="#FAAD14">警告状态</text>

  <!-- 按钮禁用 -->
  <rect x="430" y="150" width="60" height="24" rx="2" fill="#F5F5F5" stroke="none" />
  <text x="460" y="166" font-family="Arial" font-size="10" text-anchor="middle" fill="#BFBFBF">按钮</text>

  <!-- 错误状态 -->
  <rect x="430" y="180" width="120" height="20" rx="2" fill="#FFF1F0" stroke="#FFA39E" stroke-width="1" />
  <text x="490" y="195" font-family="Arial" font-size="10" text-anchor="middle" fill="#F5222D">错误状态</text>
</svg>

## 文档结束

本文档概述了LowCodeX平台的UI设计规范和组件设计标准，旨在指导开发团队和用户创建具有一致性和专业性的低代码应用。

UI设计文档将随着平台的发展持续更新，确保设计系统与功能演进保持同步。
