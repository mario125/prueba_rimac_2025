import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { CreateAppointment } from '../../core/use-cases/create-appointment';
import { GetAppointmentsByInsuredId } from '../../core/use-cases/get-appointments';
import { DynamoDBAppointmentRepository } from '../../infrastructure/database/dynamodb';
import { SNSEventPublisher } from '../../infrastructure/aws/sns';
import { Logger } from '../../shared/logger'; 

export class AppointmentController {
  static async createAppointment(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    const context = 'AppointmentController.createAppointment';

    try {
      Logger.info(context, 'Parseando body del evento');
      const body = 'body' in event ? JSON.parse(event.body || '{}') : JSON.parse(event.body || '{}');

      const repository = new DynamoDBAppointmentRepository();
      //Se encargad e enviar un aviso a SNS
      const publisher = new SNSEventPublisher();
      // validad / Guarda de DB /  Enviar aviso del evento
      const useCase = new CreateAppointment(repository, publisher);

      Logger.info(context, 'Ejecutando caso de uso CreateAppointment', { body });

      const appointment = await useCase.execute({
        insuredId: body.insuredId,
        scheduleId: body.scheduleId,
        countryISO: body.countryISO,
      });

      Logger.info(context, 'Cita creada exitosamente', { appointment });

      return {
        statusCode: 202,
        body: JSON.stringify({
          message: 'Appointment scheduling in process',
          appointmentId: appointment.appointmentId,
        }),
      };
    } catch (error) {
      Logger.error(context, 'Error al crear cita', error);
      return {
        statusCode: error instanceof Error && error.message.includes('Invalid') ? 400 : 500,
        body: JSON.stringify({
          message: error instanceof Error ? error.message : 'Internal server error',
        }),
      };
    }
  }

  static async getAppointments(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    const context = 'AppointmentController.getAppointments';

    try {
      Logger.info(context, 'Obteniendo insuredId del evento');
      const insuredId = 'pathParameters' in event ? event.pathParameters?.insuredId : event.pathParameters?.insuredId;

      if (!insuredId) {
        Logger.error(context, 'insuredId faltante');
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'insuredId is required' }),
        };
      }

      const repository = new DynamoDBAppointmentRepository();
      const useCase = new GetAppointmentsByInsuredId(repository);

      Logger.info(context, 'Ejecutando caso de uso GetAppointmentsByInsuredId', { insuredId });

      const appointments = await useCase.execute(insuredId);

      Logger.info(context, 'Citas obtenidas exitosamente', { appointments });

      return {
        statusCode: 200,
        body: JSON.stringify(appointments),
      };
    } catch (error) {
      Logger.error(context, 'Error al obtener citas', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    }
  }
}
