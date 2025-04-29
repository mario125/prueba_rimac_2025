import { Appointment } from '../domain/appointment';
import { AppointmentRepository } from '../ports/appointment-repository';
import { EventPublisher } from '../ports/event-publisher';

export class CreateAppointment {

  constructor(
    private readonly repository: AppointmentRepository,
    private readonly publisher: EventPublisher
  ) {}


  async execute(params: {
    insuredId: string;
    scheduleId: number;
    countryISO: 'PE' | 'CL';
  }): Promise<Appointment> {
    // Crear la entidad (esto valida los datos)
    const appointment = new Appointment(params);

    // Guardar en el repositorio principal (DynamoDB)
    await this.repository.save(appointment);

    // Publicar evento para procesamiento asíncrono
    await this.publisher.publish({
      type: 'APPOINTMENT_CREATED',
      payload: {
        appointmentId: appointment.appointmentId,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
      },
    });

    return appointment;
  }
}