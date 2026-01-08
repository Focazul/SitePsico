import 'dotenv/config';
import { updateSetting, getDb } from './server/db.js';

async function testUpdate() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('\nTesting database connection...');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Failed to get database connection');
      process.exit(1);
    }
    console.log('✅ Database connected!');
    
    console.log('\nTesting update...');
    const result = await updateSetting('psychologist_name', 'Marcelo Teste');
    console.log('✅ Update successful:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

testUpdate();
