import { SQSEvent } from 'aws-lambda';
import { PEAppointmentProcessor } from '../../core/use-cases/pe-appointment-processor';
import { RDSAppointmentRepository } from '../../infrastructure/database/rds';
import { EventBridgeConfirmationSender } from '../../infrastructure/aws/event-bridge';
import { Logger } from '../../shared/logger'; 


export const handler = async (event: SQSEvent): Promise<void> => {
  const processor = new PEAppointmentProcessor(
    new RDSAppointmentRepository(process.env.RDS_PE_HOST!),
    new EventBridgeConfirmationSender()
  );


  Logger.info('----> ** appointment-pe.handler', 'Recibiendo mensajes de SQS', { recordsCount: event.Records.length });

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const payload = message.payload || message;
      Logger.info('Handler', 'Mensaje procesado', {
        messageId: record.messageId,
        payload
      });
    
      Logger.info('appointment-pe.handler', 'Mensaje recibido desde SQS', { messageId: record.messageId, message });

      await processor.process({
        appointmentId: payload.appointmentId,
        insuredId: String(payload.insuredId), 
        scheduleId: Number(payload.scheduleId), 
        countryISO: payload.countryISO
      });
      
     
      Logger.info('appointment-pe.handler', 'Cita procesada correctamente', { messageId: record.messageId });
    } catch (error) {
      console.error(`Error procesando cita PE: ${error}`);
      Logger.error('appointment-pe.handler', 'Error procesando mensaje de SQS', error);
      // Implementar lógica de reintento o DLQ
    }
  }
};
