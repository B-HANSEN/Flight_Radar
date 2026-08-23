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
    personId: 'student-1',
  }
  const clearedEmergencyContact: EmergencyContact = {
    name: '',
    relation: '',
    phone: '',
    personId: 'student-1',
  }
  const emergencyContactService = {
    findByPerson: jest.fn().mockResolvedValue(emergencyContact),
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

  it('returns the emergency contact for the given person from the service', async () => {
    await expect(controller.findOne('student-1')).resolves.toBe(
      emergencyContact,
    )
    expect(emergencyContactService.findByPerson).toHaveBeenCalledWith(
      'student-1',
    )
  })

  it('updates the emergency contact for the given person via the service', async () => {
    const input = {
      name: 'Jane Doe',
      relation: 'Sister',
      phone: '+34 600 987 654',
    }
    await expect(controller.update('student-1', input)).resolves.toBe(
      emergencyContact,
    )
    expect(emergencyContactService.update).toHaveBeenCalledWith(
      'student-1',
      input,
    )
  })

  it('clears the emergency contact for the given person via the service', async () => {
    await expect(controller.clear('student-1')).resolves.toBe(
      clearedEmergencyContact,
    )
    expect(emergencyContactService.clear).toHaveBeenCalledWith('student-1')
  })
})
