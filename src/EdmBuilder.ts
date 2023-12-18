import {
  EntityDataModelSchema,
  type IEntityType,
  type IEntityDataModelSchema,
  type IEntitySet
} from './EntityDataModelSchema'

interface IEntityModelDefinition {
  namespace: string
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

  constructor () {
    this.models = []
  }

  // public methods

  /**
   * @description Adds a new model to the model array
   */
  public addModel (model: IEntityModelDefinition): EdmBuilder {
    this.models.push(model)

    return this
  }

  public createEdmModel (): IEntityDataModelSchema[] {
    const schemas: IEntityDataModelSchema[] = []
    const entitySets: IEntitySet[] = []

    // build out the entity sets so we can wire up navigation properties later
    for (const model of this.models) {
      entitySets.push({
        Name: model.entitySetName,
        EntityType: this.getEntityTypeNameFromModel(model)
      })
    }

    // build the schemas
    let schema: EntityDataModelSchema | undefined
    for (const model of this.models) {
      if (schema === undefined || schema.Namespace !== model.namespace) {
        schema = new EntityDataModelSchema(model.namespace)
        schemas.push(schema)
      }

      const entityType: IEntityType = this.buildEntityType(model)
      schema.EntityType.push(entityType)

      const modelEntityType = this.getEntityTypeNameFromModel(model)
      const navProps = entityType.NavigationProperty
      if (navProps !== undefined && navProps.length > 0) {
        const set = entitySets.find(_ => _.EntityType === modelEntityType)
        if (set === undefined) { throw new Error(`Unknown EntitySet ${modelEntityType}`) }

        set.NavigationPropertyBinding = []
        for (const prop of navProps) {
          const navSet = entitySets.find(_ => _.EntityType === prop.Type)
          if (navSet === undefined) { throw new Error(`Unknown EntitySet ${prop.Type}`) }

          set.NavigationPropertyBinding.push({
            Path: prop.Name,
            Target: navSet.Name
          })
        }
      }
    }

    schemas.push({
      Namespace: 'Default',
      EntityContainer: [{
        Name: 'Container',
        EntitySet: entitySets
      }]
    })

    return schemas
  }

  private getEntityTypeNameFromModel (model: IEntityModelDefinition): string {
    return `${model.namespace}.${model.entityName}`
  }

  private buildEntityType (model: IEntityModelDefinition): IEntityType {
    const entityType: IEntityType = {
      Name: model.entityName,
      Key: [],
      Property: []
    }

    for (const [name, value] of Object.entries(model)) {
      if (EdmBuilder.reservedProperties.includes(name)) { continue }

      const valueObj = value as IEntityProperty

      if ((value as object)['navigation' as keyof object] === true) {
        if (entityType.NavigationProperty === undefined) {
          entityType.NavigationProperty = []
        }

        entityType.NavigationProperty?.push({
          Name: name,
          Type: valueObj.type ?? ''
        })
      } else {
        entityType.Property.push({
          Name: name,
          Type: this.convertToEdmType(valueObj.type ?? 'string'),
          Nullable: valueObj.nullable ?? false
        })

        if (valueObj.key === true) {
          entityType.Key.push({ Name: name })
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
