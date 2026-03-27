const { Kafka } = require('kafkajs');
const AuditLog = require('./models/AuditLog');

const kafka = new Kafka({
  clientId: 'audit-service',
  // Nếu Node.js chạy trong Docker: tên broker là kafka:9092
  // Nếu Node.js chạy ở host (npm run dev): localhost:9092
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'audit-group' });

const runKafkaConsumer = async () => {
  try {
    await consumer.connect();
    
    // Subscribe to topic (tạo nếu chưa có)
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
