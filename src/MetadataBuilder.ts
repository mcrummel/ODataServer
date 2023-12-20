import xmlbuilder from 'xmlbuilder'
import { type IEntityDataModelSchema } from './EntityDataModelSchema'

interface IMetadataEntityType {
  '@Name': string
  Property: IMetatdataEntityProperty[]
  Key?: { PropertyRef: Array<{ '@Name': string }> }
}

interface IMetatdataEntityProperty {
  '@Name': string
  '@Type': string
  '@Nullable'?: boolean
}

interface IMetadataEntitySet {
  '@Name': string
  '@EntityType': string
  NavigationPropertyBinding?: Array<{ '@Path': string, '@Target': string }> | undefined
}

class MetadataBuilder {
  public buildMetadata (model: IEntityDataModelSchema): string {
    const metadata = {
      'edmx:Edmx': {
        '@xmlns:edmx': 'http://docs.oasis-open.org/odata/ns/edmx',
        '@Version': '4.0',
        'edmx:DataServices': {
          Schema: {
            '@Namespace': model.namespace,
            '@xmlns': 'http://docs.oasis-open.org/odata/ns/edm',
            EntityType: this.createEntityTypes(model),
            EntityContainer: {
              '@Name': 'Container',
              EntitySet: this.createEntitySets(model)
            }
          }
        }
      }
    }

    return xmlbuilder.create(metadata).end({ pretty: true })
  }

  private createEntityTypes (model: IEntityDataModelSchema): IMetadataEntityType[] {
    if (model.entityTypes === undefined) { throw new Error('model.entityTypes was undefined') }

    const entityTypes: IMetadataEntityType[] = []

    for (const type of model.entityTypes) {
      const entityType: IMetadataEntityType = {
        '@Name': type.name,
        Property: type.properties.map(p => {
          const property: IMetatdataEntityProperty = {
            '@Name': p.name,
            '@Type': p.type
          }

          if (p.nullable) {
            property['@Nullable'] = true
          }

          return property
        })
      }

      if (type.keys?.length > 0) {
        entityType.Key = {
          PropertyRef: type.keys.map(key => ({ '@Name': key }))
        }
      }

      entityTypes.push(entityType)
    }

    return entityTypes
  }

  private createEntitySets (model: IEntityDataModelSchema): IMetadataEntitySet[] {
    if (model.entitySets === undefined) { throw new Error('model.entitySets was undefined') }

    const entitySets = []
    for (const set of model.entitySets) {
      const entitySet: IMetadataEntitySet = {
        '@Name': set.name,
        '@EntityType': set.entityType
      }

      if (set.navigationPropertiesBindings != null) {
        entitySet.NavigationPropertyBinding = set.navigationPropertiesBindings.map(_ => {
          return {
            '@Path': _.path,
            '@Target': _.target
          }
        })
      }

      entitySets.push(entitySet)
    }

    return entitySets
  }
}

export {
  MetadataBuilder
}
