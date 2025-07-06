const amqp = require('amqplib');
const handleUserRegistered = require('../events/userRegisteredConsumer');

const startRabbitMQListener = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'user';
    const routingKey = 'user.registered';
    const queueName = 'rbac-service'; // puedes personalizarla

    // Asegura el exchange
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // Declara una cola
    await channel.assertQueue(queueName, { durable: true });

    // Une la cola al exchange
    await channel.bindQueue(queueName, exchange, routingKey);

    console.log(`📡 Escuchando eventos en exchange '${exchange}' con routing key '${routingKey}'`);

    // Consumir mensajes
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        await handleUserRegistered(msg);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('🔴 Error al conectar a RabbitMQ:', err.message);
  }
};

module.exports = startRabbitMQListener;
