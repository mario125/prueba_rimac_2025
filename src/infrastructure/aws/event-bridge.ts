import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { ConfirmationSender } from '../../core/ports/confirmation-sender';
import { Logger } from '../../shared/logger';

export class EventBridgeConfirmationSender implements ConfirmationSender {

  private readonly client = new EventBridgeClient({ 
    region: 'us-east-1'
  });

  async send(confirmation: {
    appointmentId: string;
    status: 'completed' | 'failed';
    processedAt: string;
    countryISO: 'PE' | 'CL';
  }): Promise<void> {


    Logger.info('----> 1', 'Enviando evento', {
      event: `--> ${JSON.stringify(confirmation)}`,
      eventBus: process.env.EVENT_BUS_NAME,
      
    });


    const eventEntry = {
      Source: "medical.appointment",
      DetailType: 'AppointmentConfirmation',
      Detail: JSON.stringify({
        metadata: {
          timestamp: new Date().toISOString(),
          service: 'appointment-service'
        },
        data: confirmation
      }),
      EventBusName: process.env.EVENT_BUS_NAME, 
    };

    Logger.info('EventBridgeConfirmationSender', 'Enviando evento', {
      event: eventEntry,
      eventBus: process.env.EVENT_BUS_NAME
    });

    try {
      const command = new PutEventsCommand({
        Entries: [eventEntry]
      });
      
      const result = await this.client.send(command);
      
      Logger.info('EventBridgeConfirmationSender', 'Evento enviado exitosamente', {
        eventId: result.Entries?.[0]?.EventId,
        appointmentId: confirmation.appointmentId
      });
    } catch (error) {
      Logger.error('EventBridgeConfirmationSender', 'Error enviando evento', error);
      throw error;
    }
  }
}