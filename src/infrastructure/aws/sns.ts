import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';  
import { EventPublisher } from '../../core/ports/event-publisher';
import { Logger } from '../../shared/logger';

export class SNSEventPublisher implements EventPublisher {
  private readonly client = new SNSClient({ region: 'us-east-1' });
  private readonly sqsClient = new SQSClient({ region: 'us-east-1' });  // Inicializamos el cliente de SQS

  async publish(event: { type: string; payload: Record<string, any>; }): Promise<void> {
    const context = 'SNSEventPublisher.publish';

    // ID único para trazabilidad
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fullEvent = {
      ...event,
      messageId, 
    };

    try {
   
      Logger.info('SNSEventPublisher', 'ARN del Topic', {
        topicArn: process.env.SNS_TOPIC_ARN,
        resolved: !!process.env.SNS_TOPIC_ARN
      });

     
      Logger.info(context, 'Mensaje a publicar', { fullEvent });

      const command = new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify(fullEvent),
        Subject: 'AppointmentCreated', // Opcional pero útil en consola SNS
        MessageAttributes: {
          countryISO: {
            DataType: 'String',
            StringValue: event.payload.countryISO.toUpperCase(), 
          },
          eventType: {
            DataType: 'String',
            StringValue: event.type,
          },
        },
      });

      await this.client.send(command);

      Logger.info(context, 'Evento publicado exitosamente', { messageId });

    } catch (error) {
      Logger.error(context, 'Error publicando evento SNS', error);
      throw error;
    }
  }

  // Método para recibir mensajes de una cola SQS
  async receiveMessagesFromSQS(queueUrl: string): Promise<void> {
    const context = 'SNSEventPublisher.receiveMessagesFromSQS';

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,  
        MaxNumberOfMessages: 10,  // Número máximo de mensajes que se recibirán
        WaitTimeSeconds: 10,  // Tiempo máximo de espera para recibir mensajes
      });

      const data = await this.sqsClient.send(command);

      if (data.Messages) {
        // Si hay mensajes, los mostramos
        Logger.info(context, 'Mensajes recibidos de la cola SQS', { messages: data.Messages });

    
        for (const message of data.Messages) {
         
          Logger.info(context, 'Procesando mensaje', { messageId: message.MessageId, body: message.Body });

        }
      } else {
        Logger.info(context, 'No se encontraron mensajes en la cola SQS');
      }
    } catch (error) {
      Logger.error(context, 'Error recibiendo mensajes desde SQS', error);
      throw error;
    }
  }
}
