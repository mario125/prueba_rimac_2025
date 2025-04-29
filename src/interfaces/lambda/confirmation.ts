import { SQSEvent } from 'aws-lambda';
import { DynamoDBAppointmentRepository } from '../../infrastructure/database/dynamodb';
import { Logger } from '../../shared/logger';

export const handler = async (event: SQSEvent): Promise<void> => {
  const repository = new DynamoDBAppointmentRepository();

  for (const record of event.Records) {
    try {
      const { detail } = JSON.parse(record.body);
      const { data } = detail;

      Logger.info('ConfirmationHandler', 'Procesando confirmación', {
        messageId: record.messageId,
        appointmentId: data.appointmentId,
        status: data.status
      });

      await repository.updateStatus(
        data.appointmentId,
        data.status,
        new Date(data.processedAt)
      );

      Logger.info('ConfirmationHandler', 'Estado actualizado exitosamente', {
        appointmentId: data.appointmentId
      });
    } catch (error: unknown) {  
      if (error instanceof Error) {  
        Logger.error('ConfirmationHandler', 'Error procesando confirmación', {
          record: record.body,
          error: error.message  
        });
      } else {
        Logger.error('ConfirmationHandler', 'Error inesperado procesando confirmación', {
          record: record.body,
          error: 'Unknown error'  
        });
      }
    }
  }
};
