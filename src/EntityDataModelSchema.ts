interface IEntityDataModelSchema {
  Namespace: string
  EntityContainer?: IEntityContainer[] | undefined
  EntityType?: IEntityType[] | undefined
}

interface IEntitySet {
  Name: string
  EntityType: string
  NavigationPropertyBinding?: Array<{
    Path: string
    Target: string
  }>
}

interface IEntityContainer {
  Name: string
  EntitySet: IEntitySet[]
}

interface IEntityType {
  Name: string
  Key: Array<{
    Name: string
  }>
  Property: Array<{
    Name: string
    Type: string
    Nullable: boolean
  }>
  NavigationProperty?: Array<{
    Name: string
    Type: string
  }>
}

interface IEntityAssociation {
  Name: string
  End: Array<{
    Type: string
    Role: string
    Multiplicity: number
  }>
}

class EntityDataModelSchema implements IEntityDataModelSchema {
  constructor (namespace: string) {
    this.Namespace = namespace
    this.EntityType = []
  }

  // Properties
  public Namespace: string
  public EntityType: IEntityType[]
}

export {
  EntityDataModelSchema,
  type IEntityDataModelSchema,
  type IEntityContainer,
  type IEntityType,
  type IEntitySet,
  type IEntityAssociation
}
