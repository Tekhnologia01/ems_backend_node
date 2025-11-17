import amqplib from "amqplib";

let channel;

// Initialize RabbitMQ connection once
export async function initRabbitMQ() {
  if (channel) return channel;

  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    console.log("✅ RabbitMQ connected");
    return channel;
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
    throw err;
  }
}

/**
 * Publish message to a RabbitMQ queue
 * @param {string} queueName - name of the queue
 * @param {Object} data - job payload
 */
export async function publishToQueue(queueName, data) {
  try {
    const ch = await initRabbitMQ();

    if (queueName === "notification_queue") {
      // Dead Letter Exchange + Queue
      await ch.assertExchange("notification.dlx", "direct", { durable: true });
      await ch.assertQueue("notification.dlq", { durable: true });
      await ch.bindQueue(
        "notification.dlq",
        "notification.dlx",
        "notification.dlq"
      );

      // Retry Queue (messages wait here then return to main queue)
      await ch.assertQueue("notification_retry", {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "", // default exchange
          "x-dead-letter-routing-key": "notification_queue",
          "x-message-ttl": 30000, // 30 sec retry delay
        },
      });

      // Main Queue (failed msgs go to retry → if fail again, DLQ)
      await ch.assertQueue("notification_queue", {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "notification.dlx",
          "x-dead-letter-routing-key": "notification.dlq",
        },
      });
    } else {
      await ch.assertQueue(queueName, { durable: true });
    }

    // Publish message
    const msg = JSON.stringify(data);
    ch.sendToQueue(queueName, Buffer.from(msg), { persistent: true });

    console.log(`📩 Published to ${queueName}:`, msg);
  } catch (err) {
    console.error(`❌ Failed to publish to ${queueName}:`, err.message);
  }
}
