import { Appointment } from '../src/core/domain/appointment';

describe('Appointment Entity', () => {
  it('debe crear una cita con valores por defecto correctos', () => {
    const cita = new Appointment({
      insuredId: '54321',
      scheduleId: 200,
      countryISO: 'CL'
    });

    expect(cita).toEqual(expect.objectContaining({
      status: 'pending',
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    }));
  });

  it('debe rechazar países no soportados', () => {
    expect(() => new Appointment({
      insuredId: '54321',
      scheduleId: 200,
      countryISO: 'PE' 
    })).toThrow('País no soportado. Use PE o CL');
  });

  it('debe actualizar el timestamp al completar', () => {
    const cita = new Appointment({
      insuredId: '54321',
      scheduleId: 200,
      countryISO: 'PE'
    });
    
    const originalUpdatedAt = cita.updatedAt;
    cita.complete();
    
    expect(cita.status).toBe('completed');
    expect(cita.updatedAt).not.toBe(originalUpdatedAt);
  });
});