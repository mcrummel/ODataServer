interface IEntityDataModelSchema {
  namespace: string
  entityTypes: IEntityType[] | undefined
  entitySets: IEntitySet[] | undefined
}

interface IEntitySet {
  name: string
  entityType: string
  navigationPropertiesBindings?: Array<{
    path: string
    target: string
  }>
}

interface IEntityContainer {
  name: string
  entitySet: IEntitySet[]
}

interface IEntityType {
  name: string
  keys: string[]
  properties: Array<{
    name: string
    type: string
    nullable: boolean
  }>
  navigationProperties?: Array<{
    name: string
    type: string
  }>
}

interface IEntityAssociation {
  name: string
  end: Array<{
    type: string
    role: string
    multiplicity: number
  }>
}

class EntityDataModelSchema implements IEntityDataModelSchema {
  constructor (namespace: string) {
    this.namespace = namespace
    this.entityTypes = []
    this.entitySets = []
  }

  // Properties
  public namespace: string
  public entityTypes: IEntityType[]
  public entitySets: IEntitySet[]
}

export {
  EntityDataModelSchema,
  type IEntityDataModelSchema,
  type IEntityContainer,
  type IEntityType,
  type IEntitySet,
  type IEntityAssociation
}
