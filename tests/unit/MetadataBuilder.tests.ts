import { expect, test, describe } from 'vitest'
import { MetadataBuilder } from '../../src/MetadataBuilder'

describe('Initialization Tests', () => {
  const builder = new MetadataBuilder()

  test('Can construct', () => {
    expect(builder).not.toBe(null)
  })
})

describe('Model generation tests', () => {
  const builder = new MetadataBuilder()
  const model = {
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

  test('Produces valid XML', () => {
    const outputXml: string = builder.buildMetadata(model)
    const expectedXml: string = `<?xml version="1.0"?>
<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
  <edmx:DataServices>
    <Schema Namespace="Tests.UnitTests" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityType Name="Person">
        <Property Name="Id" Type="Edm.Int32"/>
        <Property Name="FirstName" Type="Edm.String"/>
        <Property Name="LastName" Type="Edm.String"/>
        <Key>
          <PropertyRef Name="Id"/>
        </Key>
      </EntityType>
      <EntityType Name="Employment">
        <Property Name="Id" Type="Edm.Int32"/>
        <Property Name="EmployeeId" Type="Edm.String"/>
        <Property Name="HireDate" Type="Edm.DateTime"/>
        <Key>
          <PropertyRef Name="Id"/>
        </Key>
      </EntityType>
      <EntityType Name="TestEntity3">
        <Property Name="Id" Type="Edm.Int32"/>
        <Property Name="TestColumn" Type="Edm.String"/>
        <Key>
          <PropertyRef Name="Id"/>
        </Key>
      </EntityType>
      <EntityContainer Name="Container">
        <EntitySet Name="People" EntityType="Tests.UnitTests.Person">
          <NavigationPropertyBinding Path="Employment" Target="Employments"/>
        </EntitySet>
        <EntitySet Name="Employments" EntityType="Tests.UnitTests.Employment"/>
        <EntitySet Name="TestEntities3" EntityType="Tests.UnitTests.TestEntity3"/>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`

    expect(outputXml).toBe(expectedXml)
  })
})
