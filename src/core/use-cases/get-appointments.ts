import { AppointmentRepository } from '../ports/appointment-repository';


export class GetAppointmentsByInsuredId {
  
  constructor(private readonly repository: AppointmentRepository) {}

  
  async execute(insuredId: string) {
    return await this.repository.findByInsuredId(insuredId);
  }
}