import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { EmergencyContactService } from './emergency-contact.service'
import { EmergencyContact } from './schemas/emergency-contact.schema'

describe('EmergencyContactService', () => {
  let service: EmergencyContactService

  const emergencyContactModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyContactService,
        {
          provide: getModelToken(EmergencyContact.name),
          useValue: emergencyContactModel,
        },
      ],
    }).compile()

    service = app.get<EmergencyContactService>(EmergencyContactService)
  })

  it('returns the contact for the given person', async () => {
    const contact = {
      name: 'Jane Doe',
      relation: 'Sister',
      phone: '+34 600 987 654',
      personId: 'student-1',
    }
    emergencyContactModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(contact),
    })

    await expect(service.findByPerson('student-1')).resolves.toBe(contact)
    expect(emergencyContactModel.findOne).toHaveBeenCalledWith({
      personId: 'student-1',
    })
  })

  it('returns an empty contact when the person has none yet', async () => {
    emergencyContactModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.findByPerson('student-2')).resolves.toEqual({
      name: '',
      relation: '',
      phone: '',
      personId: 'student-2',
    })
  })

  it('upserts the contact for the given person on update', async () => {
    const updated = {
      name: 'John Smith',
      relation: 'Brother',
      phone: '+34 600 111 222',
      personId: 'student-1',
    }
    emergencyContactModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    })

    const input = {
      name: 'John Smith',
      relation: 'Brother',
      phone: '+34 600 111 222',
    }
    await expect(service.update('student-1', input)).resolves.toBe(updated)
    expect(emergencyContactModel.findOneAndUpdate).toHaveBeenCalledWith(
      { personId: 'student-1' },
      { ...input, personId: 'student-1' },
      { returnDocument: 'after', upsert: true },
    )
  })

  it('clears the contact for the given person', async () => {
    const cleared = {
      name: '',
      relation: '',
      phone: '',
      personId: 'student-1',
    }
    emergencyContactModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cleared),
    })

    await expect(service.clear('student-1')).resolves.toBe(cleared)
    expect(emergencyContactModel.findOneAndUpdate).toHaveBeenCalledWith(
      { personId: 'student-1' },
      { name: '', relation: '', phone: '' },
      { returnDocument: 'after' },
    )
  })

  it('throws when clearing a person with no contact to clear', async () => {
    emergencyContactModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.clear('student-2')).rejects.toThrow(
      'Emergency contact for student-2 not found',
    )
  })
})
