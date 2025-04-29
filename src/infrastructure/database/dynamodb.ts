import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { Appointment } from '../../core/domain/appointment';
import { AppointmentRepository } from '../../core/ports/appointment-repository';
import { Logger } from '../../shared/logger'; 

export class DynamoDBAppointmentRepository implements AppointmentRepository {
  private readonly client = new DynamoDBClient({ region: 'us-east-1' });
  private readonly tableName = process.env.DYNAMODB_TABLE!;

  async save(appointment: Appointment): Promise<void> {
    try {
      Logger.info('DynamoDBAppointmentRepository.save', 'Guardando cita', { appointmentId: appointment.appointmentId });

      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: {
          appointmentId: { S: appointment.appointmentId },
          insuredId: { S: appointment.insuredId },
          scheduleId: { N: appointment.scheduleId.toString() },
          countryISO: { S: appointment.countryISO },
          status: { S: appointment.status },
          createdAt: { S: appointment.createdAt.toISOString() },
          updatedAt: { S: appointment.updatedAt.toISOString() },
        },
        ConditionExpression: 'attribute_not_exists(appointmentId)',
      });

      await this.client.send(command);

      Logger.info('DynamoDBAppointmentRepository.save', 'Cita guardada exitosamente');
    } catch (error) {
      Logger.error('DynamoDBAppointmentRepository.save', 'Error al guardar cita', error);
      throw error;
    }
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    try {
      Logger.info('DynamoDBAppointmentRepository.findByInsuredId', 'Buscando citas por insuredId', { insuredId });

      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'insuredId-status-index',
        KeyConditionExpression: 'insuredId = :insuredId',
        ExpressionAttributeValues: {
          ':insuredId': { S: insuredId },
        },
      });

      const result = await this.client.send(command);

      const appointments = result.Items?.map(item => new Appointment({
        appointmentId: item.appointmentId.S!,
        insuredId: item.insuredId.S!,
        scheduleId: parseInt(item.scheduleId.N!),
        countryISO: item.countryISO.S! as 'PE' | 'CL',
        status: item.status.S! as 'pending' | 'completed',
        createdAt: new Date(item.createdAt.S!),
        updatedAt: new Date(item.updatedAt.S!),
      })) || [];

      Logger.info('DynamoDBAppointmentRepository.findByInsuredId', 'Citas encontradas', { count: appointments.length });

      return appointments;
    } catch (error) {
      Logger.error('DynamoDBAppointmentRepository.findByInsuredId', 'Error buscando citas', error);
      throw error;
    }
  }

  async updateStatus(appointmentId: string, status: 'pending' | 'completed', updatedAt: Date): Promise<void> {
    try {
      Logger.info('DynamoDBAppointmentRepository.updateStatus', 'Actualizando estado de cita', { appointmentId, status });

      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: { appointmentId: { S: appointmentId } },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': { S: status },
          ':updatedAt': { S: updatedAt.toISOString() },
        },
      });

      await this.client.send(command);

      Logger.info('DynamoDBAppointmentRepository.updateStatus', 'Estado actualizado exitosamente');
    } catch (error) {
      Logger.error('DynamoDBAppointmentRepository.updateStatus', 'Error actualizando estado', error);
      throw error;
    }
  }
}
