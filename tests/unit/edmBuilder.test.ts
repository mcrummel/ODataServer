import { expect, test, describe } from 'vitest'
import { EdmBuilder, type IEntityModelDefinition } from '../../src/EdmBuilder'

class EdmBuilderAccessor extends EdmBuilder {
  public override convertToEdmType = (type: string): string => {
    return super.convertToEdmType(type)
  }
}

describe('Type conversion tests', () => {
  const builder = new EdmBuilderAccessor()
  const typeMap = {
    boolean: 'Edm.Boolean',
    Boolean: 'Edm.Boolean',
    date: 'Edm.DateTime',
    Date: 'Edm.DateTime',
    dateTime: 'Edm.DateTime',
    DateTime: 'Edm.DateTime',
    dateTimeOffset: 'Edm.DateTimeOffset',
    DateTimeOffset: 'Edm.DateTimeOffset',
    decimal: 'Edm.Decimal',
    Decimal: 'Edm.Decimal',
    float: 'Edm.Float',
    Float: 'Edm.Float',
    guid: 'Edm.Guid',
    Guid: 'Edm.Guid',
    int: 'Edm.Int32',
    Int: 'Edm.Int32',
    int16: 'Edm.Int16',
    Int16: 'Edm.Int16',
    int32: 'Edm.Int32',
    Int32: 'Edm.Int32',
    int64: 'Edm.Int64',
    Int64: 'Edm.Int64',
    string: 'Edm.String',
    String: 'Edm.String',
    Unknown: 'Unknown'
  }

  for (const [name, value] of Object.entries(typeMap)) {
    test(`${name} resolves to ${value}`, () => {
      const result = builder.convertToEdmType(name)
      expect(result).toBe(value)
    })
  }
})

describe('Initialization Tests', () => {
  const builder = new EdmBuilder()

  test('Can construct', () => {
    expect(builder).not.toBe(null)
  })
})

describe('Model building tests', () => {
  const builder = new EdmBuilder()
  const defaultNs = 'Tests.UnitTests'
  const entityName = 'testEntity'
  const testModel = {
    namespace: defaultNs,
    entityName,
    entitySetName: 'TestEntity',
    Id: { type: 'int32', key: true },
    FirstName: { type: 'string' },
    LastName: { type: 'string' },
    DateOfBirth: { type: 'date', nullable: true }
  } satisfies IEntityModelDefinition

  test('Can add model ', () => {
    const expectedModel = {
      Name: entityName,
      Key: [{ Name: 'Id' }],
      Property: [
        { Name: 'Id', Type: 'Edm.Int32', Nullable: false },
        { Name: 'FirstName', Type: 'Edm.String', Nullable: false },
        { Name: 'LastName', Type: 'Edm.String', Nullable: false },
        { Name: 'DateOfBirth', Type: 'Edm.DateTime', Nullable: true }
      ]
    }

    builder.addModel(testModel)
    const model = builder.createEdmModel()
    const entityType = model.find(_ => _.Namespace === defaultNs)?.EntityType?.find(_ => _.Name === entityName)

    expect(entityType).not.toBe(null)
    expect(JSON.stringify(entityType)).toBe(JSON.stringify(expectedModel))
  })
})

describe('DataServices tests', () => {
  const builder = new EdmBuilder()
  const testModel = {
    namespace: 'Tests.UnitTests',
    entityName: 'Person',
    entitySetName: 'People',
    Id: { type: 'int32', key: true },
    FirstName: { type: 'string' },
    LastName: { type: 'string' },
    Employment: { type: 'Tests.UnitTests.Employment', navigation: true }
  } satisfies IEntityModelDefinition

  const testModel2 = {
    namespace: 'Tests.UnitTests',
    entityName: 'Employment',
    entitySetName: 'Employments',
    Id: { type: 'int32', key: true },
    EmployeeId: { type: 'string' },
    HireDate: { type: 'date' }
  } satisfies IEntityModelDefinition

  const testModel3 = {
    namespace: 'Tests.IntegrationTests',
    entityName: 'TestEntity3',
    entitySetName: 'TestEntities3',
    Id: { type: 'int32', key: true },
    TestColumn: { type: 'string' }
  } satisfies IEntityModelDefinition

  builder.addModel(testModel)
    .addModel(testModel2)
    .addModel(testModel3)

  test('Can build full schema', () => {
    const schema = builder.createEdmModel()

    const expectedSchema = [{
      Namespace: 'Tests.UnitTests',
      EntityType: [{
        Name: 'Person',
        Key: [{ Name: 'Id' }],
        Property: [
          { Name: 'Id', Type: 'Edm.Int32', Nullable: false },
          { Name: 'FirstName', Type: 'Edm.String', Nullable: false },
          { Name: 'LastName', Type: 'Edm.String', Nullable: false }
        ],
        NavigationProperty: [
          { Name: 'Employment', Type: 'Tests.UnitTests.Employment' }
        ]
      }, {
        Name: 'Employment',
        Key: [{ Name: 'Id' }],
        Property: [
          { Name: 'Id', Type: 'Edm.Int32', Nullable: false },
          { Name: 'EmployeeId', Type: 'Edm.String', Nullable: false },
          { Name: 'HireDate', Type: 'Edm.DateTime', Nullable: false }
        ]
      }]
    }, {
      Namespace: 'Tests.IntegrationTests',
      EntityType: [{
        Name: 'TestEntity3',
        Key: [{ Name: 'Id' }],
        Property: [
          { Name: 'Id', Type: 'Edm.Int32', Nullable: false },
          { Name: 'TestColumn', Type: 'Edm.String', Nullable: false }
        ]
      }]
    }, {
      Namespace: 'Default',
      EntityContainer: [{
        Name: 'Container',
        EntitySet: [
          {
            Name: 'People',
            EntityType: 'Tests.UnitTests.Person',
            NavigationPropertyBinding: [
              { Path: 'Employment', Target: 'Employments' }
            ]
          },
          { Name: 'Employments', EntityType: 'Tests.UnitTests.Employment' },
          { Name: 'TestEntities3', EntityType: 'Tests.IntegrationTests.TestEntity3' }
        ]
      }]
    }]

    expect(JSON.stringify(schema)).toBe(JSON.stringify(expectedSchema))
  })
})
