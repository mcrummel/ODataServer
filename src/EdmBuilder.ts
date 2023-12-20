import {
  EntityDataModelSchema,
  type IEntityType
} from './EntityDataModelSchema'

interface IEntityModelDefinition {
  entityName: string
  entitySetName: string
  navigation?: boolean
  [x: string]: unknown
}

interface IEntityProperty {
  name: string
  type?: string
  nullable?: boolean
  key?: boolean
}

/**
 * @description Builds an EDM schema JSON object using an IEntityType
 */
class EdmBuilder {
  private static readonly typeMap = {
    boolean: 'Edm.Boolean',
    date: 'Edm.DateTime',
    dateTime: 'Edm.DateTime',
    dateTimeOffset: 'Edm.DateTimeOffset',
    decimal: 'Edm.Decimal',
    float: 'Edm.Float',
    guid: 'Edm.Guid',
    int: 'Edm.Int32',
    int16: 'Edm.Int16',
    int32: 'Edm.Int32',
    int64: 'Edm.Int64',
    string: 'Edm.String'
  }

  // static variables
  private static readonly reservedProperties: string[] = [
    'entityName',
    'entitySetName',
    'namespace'
  ]

  // private variables
  private readonly models: IEntityModelDefinition[]
  private readonly namespace: string

  constructor (namespace: string) {
    this.models = []
    this.namespace = namespace
  }

  // public methods

  /**
   * @description Adds a new model to the model array
   */
  public addModel (model: IEntityModelDefinition): EdmBuilder {
    this.models.push(model)

    return this
  }

  public createEdmModel (): EntityDataModelSchema {
    const schema: EntityDataModelSchema = new EntityDataModelSchema(this.namespace)
    const entitySets = schema.entitySets

    // build out the entity sets so we can wire up navigation properties later
    for (const model of this.models) {
      entitySets.push({
        name: model.entitySetName,
        entityType: this.getEntityTypeNameFromModel(model)
      })
    }

    // build the schemas
    for (const model of this.models) {
      const entityType: IEntityType = this.buildEntityType(model)
      schema.entityTypes.push(entityType)

      const modelEntityType = this.getEntityTypeNameFromModel(model)
      const navProps = entityType.navigationProperties
      if (navProps !== undefined && navProps.length > 0) {
        const set = entitySets.find(_ => _.entityType === modelEntityType)
        if (set === undefined) { throw new Error(`Unknown EntitySet ${modelEntityType}`) }

        set.navigationPropertiesBindings = []
        for (const prop of navProps) {
          const navSet = entitySets.find(_ => _.entityType === prop.type)
          if (navSet === undefined) { throw new Error(`Unknown EntitySet ${prop.type}`) }

          set.navigationPropertiesBindings.push({
            path: prop.name,
            target: navSet.name
          })
        }
      }
    }

    return schema
  }

  private getEntityTypeNameFromModel (model: IEntityModelDefinition): string {
    return `${this.namespace}.${model.entityName}`
  }

  private buildEntityType (model: IEntityModelDefinition): IEntityType {
    const entityType: IEntityType = {
      name: model.entityName,
      keys: [],
      properties: []
    }

    for (const [name, value] of Object.entries(model)) {
      if (EdmBuilder.reservedProperties.includes(name)) { continue }

      const valueObj = value as IEntityProperty

      if ((value as object)['navigation' as keyof object] === true) {
        if (entityType.navigationProperties === undefined) {
          entityType.navigationProperties = []
        }

        entityType.navigationProperties?.push({
          name,
          type: valueObj.type ?? ''
        })
      } else {
        entityType.properties.push({
          name,
          type: this.convertToEdmType(valueObj.type ?? 'string'),
          nullable: valueObj.nullable ?? false
        })

        if (valueObj.key === true) {
          entityType.keys.push(name)
        }
      }
    }

    return entityType
  }

  // protected methods
  protected convertToEdmType (type: string): string {
    const key = this.firstCharToLower(type) as keyof object

    return EdmBuilder.typeMap[key] ?? type
  }

  // private methods
  private firstCharToLower (str: string): string {
    return str.replace(/^(.)/, (_: string): string => _.toLowerCase())
  }
}

export {
  EdmBuilder,
  type IEntityProperty,
  type IEntityModelDefinition
}
