import { createConnection } from 'mysql2/promise';
import { AppointmentRepository } from '../../core/ports/appointment-repository';
import { Appointment } from '../../core/domain/appointment';


export class RDSAppointmentRepository implements AppointmentRepository {
  private connection: any;

  constructor(private readonly host: string) {}

  private async ensureConnection() {
    if (!this.connection) {
      this.connection = await createConnection({
        host: this.host,
        user: process.env.RDS_USER,
        password: process.env.RDS_PASSWORD,
        database: 'medical_appointments',
      });
    }
    return this.connection;
  }

  async save(appointment: Appointment): Promise<void> {
    const conn = await this.ensureConnection();

    // Si 'processedAt' es undefined, asignamos un valor por defecto
    const processedAt = appointment.processedAt ? appointment.processedAt : new Date();

    await conn.execute(
      `INSERT INTO appointments 
      (appointment_id, insured_id, schedule_id, country_iso, status, processed_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        appointment.appointmentId,
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
        appointment.status,
        processedAt,
      ]
    );
  }

  // Implementaciones adicionales para cumplir con la interfaz
  async findByInsuredId(insuredId: string): Promise<any[]> {
    throw new Error('Method not implemented for RDS');
  }

  async updateStatus(): Promise<void> {
    throw new Error('Method not implemented for RDS');
  }
}
