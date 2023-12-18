var c = Object.defineProperty;
var o = (a, e, s) => e in a ? c(a, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : a[e] = s;
var t = (a, e, s) => (o(a, typeof e != "symbol" ? e + "" : e, s), s);
class y {
  constructor(e) {
    // Properties
    t(this, "Namespace");
    t(this, "EntityType");
    t(this, "Association");
    this.Namespace = e, this.EntityType = [], this.Association = [];
  }
}
class p {
  constructor() {
    t(this, "schemas");
    t(this, "entityTypes", []);
    t(this, "reservedProperties", [
      "entityName",
      "entitySetName"
    ]);
    t(this, "addSchema", (e) => new y(e));
    /**
     * @description Adds a new model to the model array
     */
    t(this, "addModel", (e) => {
      const s = {
        name: e.entityName,
        key: [],
        properties: []
      };
      for (const [n, i] of Object.entries(e))
        if (this.reservedProperties.includes(n)) {
          const r = n;
          s.properties[r] = {
            name: i.name,
            type: i.type,
            nullable: i.nullable === !0
          };
        }
      this.entityTypes.push(s);
    });
    t(this, "createEdmModel", () => this.models);
    this.schemas = [];
  }
}
export {
  p as EdmBuilder
};
