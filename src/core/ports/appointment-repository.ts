import { Appointment } from '../domain/appointment';


export interface AppointmentRepository {
  
  save(appointment: Appointment): Promise<void>;

  
  findByInsuredId(insuredId: string): Promise<Appointment[]>;

 
  updateStatus(
    appointmentId: string,
    status: 'pending' | 'completed',
    updatedAt: Date
  ): Promise<void>;
}