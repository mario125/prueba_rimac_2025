import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { AppointmentController } from '../http/controllers';
import { Logger } from '../../shared/logger'; 

export const handler = async (event: APIGatewayProxyEvent | APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const context = 'LambdaHandler';

  try {
    Logger.info(context, 'Evento recibido', { event });

    let httpMethod: string;

    if ('httpMethod' in event) {
      httpMethod = event.httpMethod;
    } else {
      httpMethod = event.requestContext.http.method;
    }

    Logger.info(context, 'HTTP Method identificado', { httpMethod });

    switch (httpMethod) {
      case 'POST':
        Logger.info(context, 'Enrutando a AppointmentController.createAppointment');
        return await AppointmentController.createAppointment(event);
      case 'GET':
        Logger.info(context, 'Enrutando a AppointmentController.getAppointments');
        return await AppointmentController.getAppointments(event);
      default:
        Logger.error(context, 'Método HTTP no permitido', { httpMethod });
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    Logger.error(context, 'Error inesperado en el handler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
