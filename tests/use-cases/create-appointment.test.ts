import { CreateAppointment } from '../../src/core/use-cases/create-appointment';
import { DynamoDBAppointmentRepository } from '../../src/infrastructure/database/dynamodb';
import { SNSEventPublisher } from '../../src/infrastructure/aws/sns';

describe('CreateAppointment', () => {
  it('debe crear una cita con todos los campos requeridos', async () => {
    const mockRepository = {
      save: jest.fn().mockImplementation(async (appointment) => ({
        ...appointment,
        appointmentId: 'appt-test123', 
        createdAt: new Date().toISOString()
      })),
      findByInsuredId: jest.fn(), 
      updateStatus: jest.fn() 
    };
    
    
    
    const mockPublisher = {
      publish: jest.fn().mockResolvedValue({ MessageId: 'msg123' })
    };

    const useCase = new CreateAppointment(mockRepository, mockPublisher);

    const result = await useCase.execute({
      insuredId: '12345', 
      scheduleId: 100,
      countryISO: 'PE'
    });

    
    expect(result).toHaveProperty('appointmentId');
    expect(result.appointmentId).toMatch(/^appt-/);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        insuredId: '12345',
        status: 'pending' 
      })
    );
    expect(mockPublisher.publish).toHaveBeenCalled();
  });

  it('debe fallar si el insuredId no tiene 5 dígitos', async () => {
    const mockRepository = {
      save: jest.fn(),
      findByInsuredId: jest.fn(),
      updateStatus: jest.fn()
    };
  
    const mockPublisher = {
      publish: jest.fn().mockResolvedValue({ MessageId: 'msg123' })
    };
  
    const useCase = new CreateAppointment(mockRepository, mockPublisher);
  
    await expect(useCase.execute({
      insuredId: '123', // Inválido
      scheduleId: 100,
      countryISO: 'PE'
    })).rejects.toThrow('El ID del asegurado debe tener 5 dígitos');
  });
  
});