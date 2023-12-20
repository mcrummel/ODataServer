import { expect, test, describe, expectTypeOf } from 'vitest'
import { EntityDataModelSchema, type IEntityDataModelSchema } from '../../src/EntityDataModelSchema'

describe('EntityDataModelSchema Tests', () => {
  test('EntityDataModelSchema constructor', () => {
    const ns: string = 'Test.Namespace'
    const schema = new EntityDataModelSchema(ns)

    expect(schema).not.toBeNull()
    expect(schema.namespace).toBe(ns)
    expect(schema.entitySets).not.toBeUndefined()
    expect(schema.entityTypes).not.toBeUndefined()
    expectTypeOf(schema).toMatchTypeOf<IEntityDataModelSchema>()
  })
})
