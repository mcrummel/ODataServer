import { expect, test, describe } from 'vitest'
import { EdmBuilder, type IEntityModelDefinition } from '../../src/EdmBuilder'

class EdmBuilderAccessor extends EdmBuilder {
  public override convertToEdmType = (type: string): string => {
    return super.convertToEdmType(type)
  }
}

describe('Type conversion tests', () => {
  const builder = new EdmBuilderAccessor('Tests.UnitTests')
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
  const builder = new EdmBuilder('Tests.UnitTests')

  test('Can construct', () => {
    expect(builder).not.toBe(null)
  })
})

describe('Model building tests', () => {
  const defaultNs = 'Tests.UnitTests'
  const builder = new EdmBuilder(defaultNs)
  const entityName = 'testEntity'
  const testModel: IEntityModelDefinition = {
    entityName,
    entitySetName: 'TestEntity',
    Id: { type: 'int32', key: true },
    FirstName: { type: 'string' },
    LastName: { type: 'string' },
    DateOfBirth: { type: 'date', nullable: true }
  }

  test('Can add model ', () => {
    const expectedModel = {
      name: entityName,
      keys: ['Id'],
      properties: [
        { name: 'Id', type: 'Edm.Int32', nullable: false },
        { name: 'FirstName', type: 'Edm.String', nullable: false },
        { name: 'LastName', type: 'Edm.String', nullable: false },
        { name: 'DateOfBirth', type: 'Edm.DateTime', nullable: true }
      ]
    }

    builder.addModel(testModel)
    const model = builder.createEdmModel()
    const entityType = model.entityTypes?.find(_ => _.name === entityName)

    expect(entityType).not.toBe(null)
    expect(JSON.stringify(entityType)).toBe(JSON.stringify(expectedModel))
  })
})

describe('DataServices tests', () => {
  const builder = new EdmBuilder('Tests.UnitTests')
  const testModel: IEntityModelDefinition = {
    entityName: 'Person',
    entitySetName: 'People',
    Id: { type: 'int32', key: true },
    FirstName: { type: 'string' },
    LastName: { type: 'string' },
    Employment: { type: 'Tests.UnitTests.Employment', navigation: true }
  }

  const testModel2: IEntityModelDefinition = {
    entityName: 'Employment',
    entitySetName: 'Employments',
    Id: { type: 'int32', key: true },
    EmployeeId: { type: 'string' },
    HireDate: { type: 'date' }
  }

  const testModel3: IEntityModelDefinition = {
    entityName: 'TestEntity3',
    entitySetName: 'TestEntities3',
    Id: { type: 'int32', key: true },
    TestColumn: { type: 'string' }
  }

  builder.addModel(testModel)
    .addModel(testModel2)
    .addModel(testModel3)

  test('Can build full schema', () => {
    const schema = builder.createEdmModel()

    const expectedSchema = {
      namespace: 'Tests.UnitTests',
      entityTypes: [{
        name: 'Person',
        keys: ['Id'],
        properties: [
          { name: 'Id', type: 'Edm.Int32', nullable: false },
          { name: 'FirstName', type: 'Edm.String', nullable: false },
          { name: 'LastName', type: 'Edm.String', nullable: false }
        ],
        navigationProperties: [
          { name: 'Employment', type: 'Tests.UnitTests.Employment' }
        ]
      }, {
        name: 'Employment',
        keys: ['Id'],
        properties: [
          { name: 'Id', type: 'Edm.Int32', nullable: false },
          { name: 'EmployeeId', type: 'Edm.String', nullable: false },
          { name: 'HireDate', type: 'Edm.DateTime', nullable: false }
        ]
      }, {
        name: 'TestEntity3',
        keys: ['Id'],
        properties: [
          { name: 'Id', type: 'Edm.Int32', nullable: false },
          { name: 'TestColumn', type: 'Edm.String', nullable: false }
        ]
      }],
      entitySets: [
        {
          name: 'People',
          entityType: 'Tests.UnitTests.Person',
          navigationPropertiesBindings: [
            { path: 'Employment', target: 'Employments' }
          ]
        },
        { name: 'Employments', entityType: 'Tests.UnitTests.Employment' },
        { name: 'TestEntities3', entityType: 'Tests.UnitTests.TestEntity3' }
      ]
    }

    expect(JSON.stringify(schema)).toBe(JSON.stringify(expectedSchema))
  })
})
