export interface EventPublisher {
   
    publish(event: {
      type: string; // Tipo de evento (ej: 'APPOINTMENT_CREATED')
      payload: Record<string, any>; // Datos del evento
    }): Promise<void>;
  }