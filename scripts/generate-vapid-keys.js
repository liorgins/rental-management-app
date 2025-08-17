#!/usr/bin/env node

const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('# VAPID Keys for Push Notifications');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_EMAIL=mailto:your-email@example.com');
console.log('\n📝 Note: Replace "your-email@example.com" with your actual email address.');
console.log('📝 The public key uses NEXT_PUBLIC_ prefix to be accessible to client-side code.');