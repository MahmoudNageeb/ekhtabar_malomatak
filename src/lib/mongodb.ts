import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoConnection: Promise<typeof mongoose> | null;
  // eslint-disable-next-line no-var
  var _mongoMemServer: any;
  // eslint-disable-next-line no-var
  var _adminInitialized: boolean;
  // eslint-disable-next-line no-var
  var _termsMigrated: boolean;
}

/**
 * يشغّل MongoDB Memory Server محلياً فقط (للتطوير على جهازك)
 * على Vercel/Production لازم يكون فيه MONGODB_URI من Atlas
 */
async function startLocalMongo(): Promise<string> {
  if (global._mongoMemServer) {
    return global._mongoMemServer.getUri();
  }

  // dynamic imports عشان ما يحاولش يستوردهم وقت البناء على Vercel
  const path = await import('path');
  const fs = await import('fs');

  const dbPath = path.resolve(process.cwd(), process.env.MONGODB_LOCAL_DBPATH || './data/mongodb');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

  const { MongoMemoryServer } = await import('mongodb-memory-server');

  const preferredPort = Number(process.env.MONGODB_LOCAL_PORT || 27117);
  let mem: any;
  try {
    mem = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: preferredPort }
    });
  } catch (e) {
    // لو المنفذ مشغول أو فيه lock قديم — نجرب منفذ عشوائي مع نفس مجلد البيانات
    console.warn('⚠️ فشل تشغيل MongoDB على المنفذ', preferredPort, '— سيتم استخدام منفذ عشوائي');
    mem = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger' }
    });
  }

  global._mongoMemServer = mem;
  console.log('🚀 MongoDB Local Memory Server started:', mem.getUri());
  return mem.getUri();
}

async function ensureAdmin() {
  if (global._adminInitialized) return;
  try {
    const { User } = await import('@/models/User');
    const bcrypt = (await import('bcryptjs')).default;

    const adminName = process.env.ADMIN_NAME || 'أسماء نجيب';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Asoowr4477';

    const existing = await User.findOne({ name: adminName });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        password: hashed,
        isAdmin: true,
        stage: 'admin',
        grade: 'admin',
        totalPoints: 0
      });
      console.log('👑 Admin user created:', adminName);
    } else if (!existing.isAdmin) {
      existing.isAdmin = true;
      await existing.save();
    }
    global._adminInitialized = true;
  } catch (e) {
    console.error('Admin init error:', e);
  }
}

/**
 * 🆕 ترحيل تلقائي: كل الاختبارات والتلخيصات القديمة التي لا تحمل حقل term
 * يتم تعيينها للفصل الدراسي الثاني (term-2) بدون أي حذف للبيانات.
 */
async function migrateTerms() {
  if (global._termsMigrated) return;
  try {
    const { Quiz } = await import('@/models/Quiz');
    const { Summary } = await import('@/models/Summary');

    const quizFilter = { $or: [{ term: { $exists: false } }, { term: null }, { term: '' }] } as any;
    const summaryFilter = { $or: [{ term: { $exists: false } }, { term: null }, { term: '' }] } as any;

    const [qRes, sRes] = await Promise.all([
      Quiz.updateMany(quizFilter, { $set: { term: 'term-2' } }),
      Summary.updateMany(summaryFilter, { $set: { term: 'term-2' } })
    ]);

    const qCount = (qRes as any)?.modifiedCount || 0;
    const sCount = (sRes as any)?.modifiedCount || 0;
    if (qCount || sCount) {
      console.log(`🔄 تم ترحيل البيانات إلى الترم الثاني: ${qCount} اختبار ، ${sCount} تلخيص`);
    }
    global._termsMigrated = true;
  } catch (e) {
    console.error('Terms migration error:', e);
  }
}

export async function connectDB() {
  if (global._mongoConnection) {
    await global._mongoConnection;
    await ensureAdmin();
    await migrateTerms();
    return global._mongoConnection;
  }

  let uri = process.env.MONGODB_URI?.trim();

  // على Vercel فقط لازم يكون MONGODB_URI متاح
  // (في التطوير المحلي حتى لو production build، نستخدم MongoDB Memory Server)
  if (!uri) {
    if (process.env.VERCEL) {
      throw new Error(
        '❌ MONGODB_URI غير موجود! من فضلك أضف رابط MongoDB Atlas في إعدادات Vercel Environment Variables'
      );
    }
    // تطوير محلي - يستخدم MongoDB Memory Server
    uri = await startLocalMongo();
  }

  global._mongoConnection = mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'ekhtabar_malomatak',
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000
  });

  await global._mongoConnection;
  await ensureAdmin();
  await migrateTerms();
  return global._mongoConnection;
}

export default connectDB;
