const amqp = require("amqplib/callback_api");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
}

// create connection
amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }

  // create channel
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    // declare exchange
    const exhange = "direct_logs";

    // assert exchange
    channel.assertExchange(exhange, "direct", {
      durable: false,
    });

    // assert the queue
    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      (error2, q) => {
        if (error2) {
          throw error2;
        }

        // create binding between queue and exchange using binding keys
        args.forEach((severity) => {
          channel.bindQueue(q.queue, exhange, severity);
        });

        // consume message from queue
        channel.consume(
          q.queue,
          (msg) => {
            console.log(
              `[<--] ${msg.fields.routingKey}: ${msg.content.toString()}`
            );
          },
          {
            noAck: true,
          }
        );
      }
    );
  });
});
