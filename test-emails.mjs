import { sendContactAutoReply, sendNewContactNotification } from './server/_core/email.js';

console.log('Testing email functions...');

(async () => {
  try {
    console.log('[Test] Sending contact auto-reply...');
    const result1 = await sendContactAutoReply({
      recipientEmail: 'marcelo@test.com',
      senderName: 'Test User',
      psychologistName: 'Test Psychologist',
    });
    console.log('[Test] Contact auto-reply result:', result1);

    console.log('[Test] Sending new contact notification...');
    const result2 = await sendNewContactNotification({
      senderName: 'Test User',
      senderEmail: 'marcelo@test.com',
      senderPhone: '11999999999',
      subject: 'Test Subject',
      message: 'Test message content',
    });
    console.log('[Test] New contact notification result:', result2);

    process.exit(0);
  } catch (error) {
    console.error('[Test] Error:', error);
    process.exit(1);
  }
})();
