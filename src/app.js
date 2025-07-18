const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const rbacRoutes = require('./routes/rbacRoutes');
const UserRole = require('./models/UserRole');

// Variables de entorno
require('dotenv').config();
const PORT = process.env.PORT || 4005;
const MONGO_URI = process.env.MONGO_URI;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://54.225.75.133:3000';

const app = express();

// ✅ CORS configurado correctamente
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Para preflight

app.use(express.json());

// Rutas API
app.use('/api/rbac', rbacRoutes);
app.get('/', (_, res) => res.send('✅ ms-rbac activo'));

// Función para procesar evento user.registered
const handleUserRegistered = async (msg) => {
  try {
    const event = JSON.parse(msg.content.toString());
    const { id: userId, role } = event.data;

    if (!userId || !role) {
      console.warn('⚠️ Evento user.registered con datos incompletos');
      return;
    }

    await UserRole.findOneAndUpdate(
      { userId },
      { role },
      { upsert: true, new: true }
    );

    console.log(`🟢 Rol '${role}' asignado al usuario ${userId}`);
  } catch (err) {
    console.error('🔴 Error procesando evento user.registered:', err.message);
  }
};

// Función para conectar a RabbitMQ y escuchar eventos desde exchange "user"
const startRabbitMQListener = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'user';
    const routingKey = 'user.registered';
    const queueName = 'rbac-service';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchange, routingKey);

    console.log(`📡 Escuchando eventos en exchange '${exchange}' con routing key '${routingKey}'`);

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

// Conectar a Mongo y levantar servidor
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 ms-rbac corriendo en puerto ${PORT}`);
      startRabbitMQListener(); // 🔁 Escuchar eventos
    });
  })
  .catch((err) => {
    console.error('🔴 Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
