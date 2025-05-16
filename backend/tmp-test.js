// 测试Prisma模型
const { PrismaClient } = require('./generated/prisma');

async function testPrisma() {
  console.log('正在测试Prisma客户端...');
  const prisma = new PrismaClient();

  try {
    console.log('PrismaClient已成功导入');
    console.log('客户端模型:', Object.keys(prisma));

    // 如果MetaTable模型存在
    if (prisma.metaTable) {
      console.log('MetaTable模型已发现');
      try {
        const count = await prisma.metaTable.count();
        console.log(`数据库中有 ${count} 张元表`);
      } catch (err) {
        console.error('访问MetaTable时出错:', err);
      }
    } else {
      console.error('找不到MetaTable模型，prisma.metaTable未定义');
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('Prisma测试失败:', err);
  }
}

testPrisma().catch(console.error);
