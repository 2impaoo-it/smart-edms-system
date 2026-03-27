const { Kafka } = require('kafkajs');
const AuditLog = require('./models/AuditLog');

const kafka = new Kafka({
  clientId: 'audit-service',
  // Nếu Node.js chạy trong Docker: tên broker là kafka:9092
  // Nếu Node.js chạy ở host (npm run dev): localhost:9092
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const admin = kafka.admin();
const consumer = kafka.consumer({ groupId: 'audit-group' });

const runKafkaConsumer = async () => {
  try {
    // 1. Khởi tạo Kênh (Topic) tự động nếu chưa có mặt trên Server
    await admin.connect();
    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes('smartedms.audit.logs')) {
      console.log('[Kafka Admin] ⚠️ Topic chưa tồn tại. Đang tự động cấp phép và tạo Topic mới...');
      await admin.createTopics({
        topics: [{ topic: 'smartedms.audit.logs', numPartitions: 1 }]
      });
    }
    await admin.disconnect();

    // 2. Khởi động người nghe (Consumer)
    await consumer.connect();
    
    // Subscribe to topic
    await consumer.subscribe({ topic: 'smartedms.audit.logs', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const logData = JSON.parse(message.value.toString());
          console.log(`[Kafka Consumer] 🔥 Nhận log mới: ${logData.action} từ ${logData.actorName}`);
          
          await AuditLog.create(logData);
          console.log(`[Kafka Consumer] ✅ Lưu MongoDB thành công!`);

          // Nếu thiết kế Global IO cho WebSocket
          // io.emit('new_audit_log', logData);
        } catch (err) {
          console.error('[Kafka Consumer] Lỗi khi Decode/Lưu message:', err);
        }
      },
    });
    
    console.log('[Kafka Consumer] 🚀 Đã kết nối Kafka thành công và đang lắng nghe...');
  } catch (error) {
    console.error('[Kafka Consumer] ❌ Lỗi khởi tạo Kafka:', error);
  }
};

module.exports = runKafkaConsumer;
