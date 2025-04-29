// // confirmation.ts

// import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
// import { ConfirmationSender } from '../../core/ports/confirmation-sender';
// import { Logger } from '../../shared/logger';


// export class EventBridgeConfirmationSender implements ConfirmationSender {
//   private readonly client: EventBridgeClient;
//   private readonly eventBusName: string;

//   constructor() {
//     this.client = new EventBridgeClient({
//       region: 'us-east-1'
//     });
//     this.eventBusName = process.env.EVENT_BUS_NAME || 'default';
//   }


//   async send(confirmation: {
//     appointmentId: string;
//     status: 'completed' | 'failed';
//     processedAt: string;
//   }): Promise<void> {
//     const params = {
//       Entries: [
//         {
//           Source: 'medical-appointments',
//           DetailType: 'AppointmentConfirmation',
//           Detail: JSON.stringify({
//             metadata: {
//               service: 'medical-appointment-api',
//               timestamp: new Date().toISOString()
//             },
//             data: confirmation
//           }),
//           EventBusName: this.eventBusName,
//         }
//       ]
//     };

//     try {
//       const command = new PutEventsCommand(params);
//       const result = await this.client.send(command);
      
//       Logger.info('EventBridgeConfirmationSender', 'Evento enviado', {
//         eventId: result.Entries?.[0]?.EventId,
//         confirmationData: confirmation
//       });

//     } catch (error) {
//       Logger.error('EventBridgeConfirmationSender', 'Error enviando confirmación', error as Error);
//       throw new Error('Failed to send confirmation');
//     }
//   }
// }