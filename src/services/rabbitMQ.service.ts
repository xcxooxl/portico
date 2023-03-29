import * as amqp from 'amqplib/callback_api';
import { Injectable } from '@nestjs/common';

export enum QueueNames {
  CREATE_RECORDS = 'create-records',
  ERROR_QUEUES = 'error-queues', // I will not implement this..
  // but let's assume we should have one to notify users about errors
}

@Injectable()
export class RabbitMQService {
  private readonly url: string;

  constructor() {
    const rabbitUser = process.env.RABBIT_USER;
    const rabbitPass = process.env.RABBIT_PASS;
    const rabbitHost = process.env.RABBIT_HOST;
    const rabbitPort = process.env.RABBIT_PORT;
    this.url = `amqp://${rabbitUser}:${rabbitPass}@${rabbitHost}`;
  }

  public async publish(queueName: QueueNames, message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      amqp.connect(this.url, (err, conn) => {
        if (err) {
          return reject(err);
        }

        conn.createChannel(async (err, ch) => {
          if (err) {
            return reject(err);
          }

          // console.log(ch);
          await ch.assertQueue(queueName, { durable: true });
          await ch.sendToQueue(queueName, Buffer.from(message));

          resolve();
        });
      });
    });
  }

  public async consume(
    queueName: QueueNames,
    callback: (message: string) => Promise<void>,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      amqp.connect(this.url, (err, conn) => {
        if (err) {
          return reject(err);
        }

        conn.createChannel((err, ch) => {
          if (err) {
            return reject(err);
          }

          ch.assertQueue(queueName, { durable: true });

          const consumeMessage = async () => {
            ch.consume(queueName, async (msg) => {
              if (msg) {
                const message = msg.content.toString();
                console.log(`Received message: ${message}`);

                try {
                  await callback(message);
                  ch.ack(msg);
                } catch (err) {
                  ch.nack(msg);
                }

                // Consume the next message
                consumeMessage();
              }
            });
          };

          console.log(`Waiting for messages on queue ${queueName}`);
          consumeMessage();

          // Close the channel and connection on SIGINT
          process.once('SIGINT', () => {
            ch.close();
            conn.close();
          });

          resolve();
        });
      });
    });
  }
}
