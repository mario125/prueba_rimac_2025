import { BaseAppointmentProcessor } from './base-appointment-processor';
import { Appointment } from '../domain/appointment';
import { Logger } from '../../shared/logger'; 

export class CLAppointmentProcessor extends BaseAppointmentProcessor {

  async process(params: {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: 'PE' | 'CL';
  }): Promise<void> {
    
        Logger.info('CHILE Processor-->', 'Procesando cita', params);
    
        // Validar parámetros antes de crear Appointment
        if (!params.appointmentId || !params.insuredId || !params.scheduleId) {
          throw new Error('Parámetros incompletos para procesar cita');
        }
    
        const appointment = new Appointment({
          ...params,
          status: 'completed',
          processedAt: new Date()
        });
    
        // Guardar la cita en la base de datos de Perú
        await this.repository.save(appointment);
    
        // Enviar confirmación
        await this.sendConfirmation(params.appointmentId);
  }
}
