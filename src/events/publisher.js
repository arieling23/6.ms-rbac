const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertExchange('user', 'topic', { durable: true });
}

async function publishEvent(routingKey, data) {
  if (!channel) {
    await connectRabbitMQ();
  }
  channel.publish('user', routingKey, Buffer.from(JSON.stringify(data)));
  console.log(`📤 Evento publicado: ${routingKey}`, data);
}

module.exports = { publishEvent };
