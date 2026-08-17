import { Test, TestingModule } from '@nestjs/testing'
import { EmergencyContactController } from './emergency-contact.controller'
import { EmergencyContactService } from './emergency-contact.service'
import { EmergencyContact } from './schemas/emergency-contact.schema'

describe('EmergencyContactController', () => {
  let controller: EmergencyContactController
  const emergencyContact: EmergencyContact = {
    name: 'Jane Doe',
    relation: 'Sister',
    phone: '+34 600 987 654',
    studentId: 'student-1',
  }
  const clearedEmergencyContact: EmergencyContact = {
    name: '',
    relation: '',
    phone: '',
    studentId: 'student-1',
  }
  const emergencyContactService = {
    findOne: jest.fn().mockResolvedValue(emergencyContact),
    update: jest.fn().mockResolvedValue(emergencyContact),
    clear: jest.fn().mockResolvedValue(clearedEmergencyContact),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyContactController],
      providers: [
        { provide: EmergencyContactService, useValue: emergencyContactService },
      ],
    }).compile()

    controller = app.get<EmergencyContactController>(EmergencyContactController)
  })

  it('returns the emergency contact from the service', async () => {
    await expect(controller.findOne()).resolves.toBe(emergencyContact)
    expect(emergencyContactService.findOne).toHaveBeenCalled()
  })

  it('updates the emergency contact via the service', async () => {
    const input = {
      name: 'Jane Doe',
      relation: 'Sister',
      phone: '+34 600 987 654',
    }
    await expect(controller.update(input)).resolves.toBe(emergencyContact)
    expect(emergencyContactService.update).toHaveBeenCalledWith(input)
  })

  it('clears the emergency contact via the service', async () => {
    await expect(controller.clear()).resolves.toBe(clearedEmergencyContact)
    expect(emergencyContactService.clear).toHaveBeenCalled()
  })
})
