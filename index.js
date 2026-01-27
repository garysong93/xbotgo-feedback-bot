require('dotenv').config();
const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 存储用户选择的分类（临时存储）
const userSelections = new Map();

// Google Sheets 配置
const GOOGLE_CREDENTIALS_PATH = './google-credentials.json';
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// 初始化 Google Sheets API
async function getGoogleSheetsClient() {
  const credentials = JSON.parse(fs.readFileSync(GOOGLE_CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// 写入数据到 Google Sheets
async function appendToSheet(username, categories, feedbackDetail, userId, timestamp) {
  try {
    const sheets = await getGoogleSheetsClient();

    // 格式化时间戳
    const formattedTime = new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const values = [[username, categories, feedbackDetail, userId, formattedTime]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E', // 假设数据在 Sheet1，列 A-E
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`📊 Data synced to Google Sheets: ${username} | ${categories}`);
  } catch (error) {
    console.error('❌ Error writing to Google Sheets:', error.message);
  }
}

// Bot 启动
client.once('ready', async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ XbotGo Feedback Bot started successfully!');
  console.log(`📱 Bot account: ${client.user.tag}`);
  console.log(`🏠 Server count: ${client.guilds.cache.size}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 发送固定的反馈消息
  try {
    const feedbackChannel = client.channels.cache.get(process.env.FEEDBACK_CHANNEL_ID);
    if (feedbackChannel) {
      // 删除旧的 pinned 反馈消息（避免旧按钮失效）
      try {
        const pinnedMessages = await feedbackChannel.messages.fetchPins();
        pinnedMessages.forEach(async (msg) => {
          if (msg.author.id === client.user.id && msg.embeds[0]?.title === '🦅 Falcon Product Feedback') {
            await msg.unpin();
            await msg.delete();
            console.log('🗑️ Deleted old feedback message');
          }
        });
      } catch (err) {
        console.log('⚠️ Could not fetch/delete old pinned messages:', err.message);
      }

      // 创建按钮
      const feedbackButton = new ButtonBuilder()
        .setCustomId('feedbackButton')
        .setLabel('📝 Submit Feedback')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🦅');

      const row = new ActionRowBuilder().addComponents(feedbackButton);

      // 创建 Embed 消息
      const embed = new EmbedBuilder()
        .setColor('#FF8C00')
        .setTitle('🦅 Falcon Product Feedback')
        .setDescription(
          '**We value your feedback!**\n\n' +
          'Help us improve Falcon by sharing your experience, suggestions, or reporting issues.\n\n' +
          '**How to submit:**\n' +
          '1️⃣ Click the "Submit Feedback" button below\n' +
          '2️⃣ Select one or more categories\n' +
          '3️⃣ Describe your feedback in detail\n\n' +
          '**Categories:**\n' +
          '⚙️ Set-Up | 🎯 Tracking Issue | 🔧 Hardware Issue\n' +
          '📱 App Feature | 📡 Live Stream | 💡 Other\n\n' +
          '✨ Your feedback helps us make Falcon better!'
        )
        .setFooter({ text: 'XbotGo Team • Thank you for your support!' })
        .setTimestamp();

      // 发送消息并 pin 住
      const message = await feedbackChannel.send({
        embeds: [embed],
        components: [row]
      });

      await message.pin();
      console.log('📌 Feedback message pinned successfully!');
    }
  } catch (error) {
    console.error('❌ Error sending feedback message:', error.message);
  }
});

// 创建分类选择菜单的函数（复用）
function createCategorySelectMenu() {
  return new StringSelectMenuBuilder()
    .setCustomId('categorySelect')
    .setPlaceholder('Select feedback categories (multiple selections allowed)')
    .setMinValues(1)
    .setMaxValues(6)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Set-Up')
        .setDescription('Issues related to initial setup and installation')
        .setValue('Set-Up')
        .setEmoji('⚙️'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Tracking Issue')
        .setDescription('Problems with tracking functionality')
        .setValue('Tracking Issue')
        .setEmoji('🎯'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Hardware Issue')
        .setDescription('Hardware-related problems')
        .setValue('Hardware Issue')
        .setEmoji('🔧'),
      new StringSelectMenuOptionBuilder()
        .setLabel('App Feature')
        .setDescription('App features and functionality')
        .setValue('App Feature')
        .setEmoji('📱'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Live Stream')
        .setDescription('Live streaming related issues')
        .setValue('Live Stream')
        .setEmoji('📡'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Other')
        .setDescription('Other feedback or suggestions')
        .setValue('Other')
        .setEmoji('💡')
    );
}

// 监听按钮点击
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'feedbackButton') {
    const categorySelect = createCategorySelectMenu();
    const row = new ActionRowBuilder().addComponents(categorySelect);

    await interaction.reply({
      content: '🦅 **Falcon Product Survey**\n\nPlease select one or more feedback categories:',
      components: [row],
      ephemeral: true
    });
  }
});

// 监听斜杠命令（保留作为备用）
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'feedback') {
    const categorySelect = createCategorySelectMenu();
    const row = new ActionRowBuilder().addComponents(categorySelect);

    await interaction.reply({
      content: '🦅 **Falcon Product Survey**\n\nPlease select one or more feedback categories:',
      components: [row],
      ephemeral: true
    });
  }
});

// 监听 Select Menu 选择
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'categorySelect') {
    // 保存用户选择的分类
    const selectedCategories = interaction.values;
    userSelections.set(interaction.user.id, selectedCategories);

    // 创建 Modal 表单
    const modal = new ModalBuilder()
      .setCustomId('feedbackModal')
      .setTitle('🦅 Falcon Product Survey');

    // 详细内容输入框
    const detailInput = new TextInputBuilder()
      .setCustomId('feedbackDetail')
      .setLabel('Detailed Feedback')
      .setPlaceholder('Please describe your feedback in detail...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(1000);

    const row = new ActionRowBuilder().addComponents(detailInput);
    modal.addComponents(row);

    // 显示 Modal
    await interaction.showModal(modal);
  }
});

// 监听 Modal 提交
client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'feedbackModal') {
    // 获取用户填写的内容
    const feedbackDetail = interaction.fields.getTextInputValue('feedbackDetail');

    // 获取之前保存的分类
    const selectedCategories = userSelections.get(interaction.user.id);
    const feedbackType = selectedCategories ? selectedCategories.join(', ') : 'Unknown';

    // 先立即回复用户（避免 3 秒超时）
    await interaction.reply({
      content: '✅ **Thank you for your feedback!**\n\nWe have received your feedback and will take it seriously. Your input is very important to us!',
      ephemeral: true
    });

    // 记录日志
    console.log(`🦅 New Falcon feedback - User: ${interaction.user.tag} | Categories: ${feedbackType}`);

    // 同步到 Google Sheets
    await appendToSheet(
      interaction.user.tag,           // Username
      feedbackType,                   // Categories
      feedbackDetail,                 // Feedback Details
      interaction.user.id,            // User ID
      new Date().toISOString()        // Submission Time
    );

    // 清理用户选择数据
    userSelections.delete(interaction.user.id);
  }
});

// 错误处理
client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// 登录 Bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Bot login failed!');
  console.error('Please check if DISCORD_TOKEN in .env file is correct');
  console.error('Error details:', error.message);
  process.exit(1);
});
