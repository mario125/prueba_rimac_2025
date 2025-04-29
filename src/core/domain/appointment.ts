import { Logger } from '../../shared/logger'; 

export class Appointment {
  
  public readonly appointmentId: string;
  public readonly insuredId: string;
  public readonly scheduleId: number;
  public readonly countryISO: 'PE' | 'CL';
  public status: 'pending' | 'completed';
  public readonly createdAt: Date;
  public updatedAt: Date;
  public processedAt?: Date;  

  
  constructor(params: {
    appointmentId?: string;
    insuredId: string;
    scheduleId: number;
    countryISO: 'PE' | 'CL';
    status?: 'pending' | 'completed';
    createdAt?: Date;
    updatedAt?: Date;
    processedAt?: Date; 
  }) {


    Logger.info('Appointment', '******Recibiendo datos para procesar la cita',  JSON.stringify(params) );
    
    const insuredId = params.insuredId.trim();  

    

    
    if (!/^\d{5}$/.test(insuredId)) {
      Logger.error('Appointment', 'Error en validación de insuredId', {
        insuredId,
        message: 'El ID del asegurado debe tener 5 dígitos'
      });
      throw new Error('El ID del asegurado debe tener 5 dígitos');
    } else {
      Logger.info('Appointment', 'ID del asegurado válido', { insuredId });
    }

    
    if (!['PE', 'CL'].includes(params.countryISO)) {
      Logger.error('Appointment', 'Error en validación de countryISO', {
        countryISO: params.countryISO,
        message: 'País no soportado. Use PE o CL'
      });
      throw new Error('País no soportado. Use PE o CL');
    }

    
    this.appointmentId = params.appointmentId || this.generateId();
    this.insuredId = params.insuredId;
    this.scheduleId = params.scheduleId;
    this.countryISO = params.countryISO;
    this.status = params.status || 'pending'; 
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.processedAt = params.processedAt; 

    
    Logger.info('Appointment', 'Cita creada correctamente', {
      appointmentId: this.appointmentId,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      countryISO: this.countryISO,
      status: this.status,
      createdAt: this.createdAt
    });
  }

  
  public complete(): void {
    this.status = 'completed';
    this.updatedAt = new Date();
    Logger.info('Appointment', 'Cita marcada como completada', { appointmentId: this.appointmentId });
  }

  
  private generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'appt-';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
