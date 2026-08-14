---
name: new-nest-module
description: Scaffold a new NestJS + Mongoose feature module under server/src/ (schema, service, controller, controller spec, module) in this repo's established shape. Use when the user asks to add a backend module, a new API entity/resource, or to wire a new collection into the server. Ensures the module is registered in app.module.ts and seeded in seed.ts in the same pass, since a module that exists but isn't wired in either place silently returns nothing (404 or empty array) rather than erroring.
---

Add a new flat module under `server/src/<name>/` (kebab-case, plural if the entity is a list — e.g. `bookings`, `documents`, singular `health` is the one exception). Follow `server/src/bookings/` as the reference implementation — copy its shape exactly rather than improvising. No DTOs, no `common/` guards, no auth — this project has no Users/auth module yet, so any per-student field is a plain string `studentId` with a comment, not a Mongoose ref.

## Files

```
server/src/<name>/
  <name>.module.ts
  <name>.controller.ts
  <name>.controller.spec.ts
  <name>.service.ts
  schemas/<singular-name>.schema.ts
```

### Schema — `schemas/<singular-name>.schema.ts`

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type <Name>Document = HydratedDocument<<Name>>

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string }).toString()
      delete ret._id
    },
  },
})
export class <Name> {
  @Prop({ required: true })
  someField!: string

  @Prop()
  optionalField?: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const <Name>Schema = SchemaFactory.createForClass(<Name>)
```

Only include the `studentId` prop (with that exact comment) if the entity is per-student data. Shared/global entities (news, weather, aircraft) skip it. The `toJSON` transform block is copied verbatim on every schema in this repo — never omit it, the frontend's `id` field depends on it.

### Service — `<name>.service.ts`

```ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { <Name>, <Name>Document } from './schemas/<singular-name>.schema'

@Injectable()
export class <Name>Service {
  constructor(
    @InjectModel(<Name>.name)
    private readonly <name>Model: Model<<Name>Document>,
  ) {}

  findAll() {
    return this.<name>Model.find().exec()
  }
}
```

Add further methods (`sign`, `findOne`, etc.) only if the task actually needs them — see `flight-evaluations.service.ts` for the shape of a mutation method (`findByIdAndUpdate` + `NotFoundException` if nothing matched).

### Controller — `<name>.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common'
import { <Name>Service } from './<name>.service'

@Controller('<kebab-plural-route>')
export class <Name>Controller {
  constructor(private readonly <name>Service: <Name>Service) {}

  @Get()
  findAll() {
    return this.<name>Service.findAll()
  }
}
```

### Controller spec — `<name>.controller.spec.ts`

```ts
import { Test, TestingModule } from '@nestjs/testing'
import { <Name>Controller } from './<name>.controller'
import { <Name>Service } from './<name>.service'
import { <Name> } from './schemas/<singular-name>.schema'

describe('<Name>Controller', () => {
  let controller: <Name>Controller
  const items: <Name>[] = [
    /* one representative record */
  ]
  const <name>Service = { findAll: jest.fn().mockResolvedValue(items) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [<Name>Controller],
      providers: [{ provide: <Name>Service, useValue: <name>Service }],
    }).compile()

    controller = app.get<<Name>Controller>(<Name>Controller)
  })

  it('returns the <name> from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(items)
    expect(<name>Service.findAll).toHaveBeenCalled()
  })
})
```

Services aren't unit-tested directly in this repo (no `*.service.spec.ts` files exist) — the controller spec with a mocked service is the only backend test per module.

### Module — `<name>.module.ts`

```ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { <Name>Controller } from './<name>.controller'
import { <Name>Service } from './<name>.service'
import { <Name>, <Name>Schema } from './schemas/<singular-name>.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: <Name>.name, schema: <Name>Schema }])],
  controllers: [<Name>Controller],
  providers: [<Name>Service],
})
export class <Name>Module {}
```

## Steps

1. Create the five files above under `server/src/<name>/`.
2. Wire the module into `server/src/app.module.ts`: add the import statement in alphabetical order by import path among the other feature-module imports (after the `HealthModule` import, before/after neighbors per the module name — `Health` itself is the only module kept out of alpha order, placed first in the `imports:` array since it's the connectivity smoke test). Add `<Name>Module` to the `imports:` array in the same alphabetical position, after `HealthModule`.
3. Add seed data to `server/src/seed/seed.ts`: import the schema type, define a `const <name>: Omit<<Name>, '_id'>[] = [...]` array with realistic records, get the model via `app.get<Model<<Name>>>(getModelToken(<Name>.name))` inside `seed()`, and call `await seedMany(<name>Model, <name>, '<label>')` — keep each of these three insertion points in the same relative order as the existing ones (roughly alphabetical by entity).
4. If a frontend page or component currently reads from a `DUMMY_*` export, swap it for `fetchApi<<Type>[]>('/<route>')` and delete the now-unused `DUMMY_*` export once nothing imports it — don't leave dead dummy data behind.
5. Run `cd server && npm run test` (or `npx jest <name>.controller.spec.ts`) and `npm run seed` against a real `MONGODB_URI` to confirm the collection actually populates.
