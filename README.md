# XbotGo Discord Feedback Bot

Discord 表单式用户反馈收集 Bot

## 功能特性

✅ 弹窗式表单（Modal Forms）- 用户体验极佳
✅ 美化的反馈消息（Embed）
✅ 自动收集到指定频道
✅ 支持多种反馈类型
✅ 用户友好的提示信息

## 配置步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Discord Bot

1. 访问 https://discord.com/developers/applications
2. 创建新应用或选择现有应用
3. 在 "Bot" 标签页获取 Token
4. 在 "OAuth2" 标签页找到 Client ID

### 3. 创建 .env 文件

复制 `.env.example` 为 `.env`，然后填写：

```env
DISCORD_TOKEN=你的Bot Token
CLIENT_ID=你的Client ID
GUILD_ID=1174640776358150236
FEEDBACK_CHANNEL_ID=1432922752490274837
```

### 4. 注册斜杠命令

```bash
npm run deploy
```

### 5. 启动 Bot

```bash
npm start
```

## 使用方法

1. 在 Discord 中输入 `/feedback`
2. 弹出表单窗口
3. 填写产品型号、反馈类型、详细内容
4. 点击提交
5. 反馈自动发送到指定频道

## 项目结构

```
xbotgo-feedback-bot/
├── index.js              # 主程序
├── deploy-commands.js    # 命令注册
├── package.json          # 依赖配置
├── .env                  # 环境变量（需自己创建）
└── README.md            # 说明文档
```

## 技术栈

- Discord.js v14
- Node.js
- dotenv

## 支持

如有问题请联系开发者。
