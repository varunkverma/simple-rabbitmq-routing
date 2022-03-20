const amqp = require("amqplib/callback_api");

// create connection
amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }

  // create channel
  connection.createChannel((error1, channel) => {
    // declare exhange
    const exchange = "direct_logs";

    const args = process.argv.slice(2);
    const msg = args.slice(1).join(" ") || "Hello World";

    const severity = args.length > 0 ? args[0] : "info";

    // assert exchange with direct type
    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    // publish msg to the exchange using routing key, severity
    channel.publish(exchange, severity, Buffer.from(msg));
    console.log(`[-->] Sent ${severity}: ${msg}`);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
});
