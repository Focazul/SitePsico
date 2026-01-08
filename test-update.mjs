// Test update setting
import { updateSetting } from './server/db';

async function testUpdate() {
  try {
    console.log('Testing update...');
    const result = await updateSetting('psychologist_name', 'Marcelo Teste');
    console.log('✅ Update successful:', result);
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
  process.exit(0);
}

testUpdate();
