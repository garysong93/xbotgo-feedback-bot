require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// 检查必要的环境变量
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  console.error('❌ 错误: 缺少必要的环境变量!');
  console.error('请确保 .env 文件中包含:');
  console.error('  - DISCORD_TOKEN');
  console.error('  - CLIENT_ID');
  console.error('  - GUILD_ID');
  process.exit(1);
}

// 定义斜杠命令
const commands = [
  new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('🦅 Submit Falcon product feedback (survey form)')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 开始注册斜杠命令...');
    console.log(`📋 命令数量: ${commands.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('✅ 斜杠命令注册成功！');
    console.log(`📝 已注册 ${data.length} 个命令:`);
    data.forEach(cmd => {
      console.log(`   - /${cmd.name}: ${cmd.description}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 提示: 现在可以运行 "npm start" 启动 Bot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ 命令注册失败!');
    console.error('错误详情:', error);

    if (error.code === 50001) {
      console.error('\n💡 提示: Bot 缺少权限，请检查:');
      console.error('  1. Bot 是否已加入服务器');
      console.error('  2. Bot 是否有 "applications.commands" 权限');
    }
  }
})();
