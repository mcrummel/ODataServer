(function(t,e){typeof exports=="object"&&typeof module<"u"?e(exports):typeof define=="function"&&define.amd?define(["exports"],e):(t=typeof globalThis<"u"?globalThis:t||self,e(t.ODataServer={}))})(this,function(t){"use strict";var p=Object.defineProperty;var y=(t,e,i)=>e in t?p(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var s=(t,e,i)=>(y(t,typeof e!="symbol"?e+"":e,i),i);class e{constructor(n){s(this,"Namespace");s(this,"EntityType");s(this,"Association");this.Namespace=n,this.EntityType=[],this.Association=[]}}class i{constructor(){s(this,"schemas");s(this,"entityTypes",[]);s(this,"reservedProperties",["entityName","entitySetName"]);s(this,"addSchema",n=>new e(n));s(this,"addModel",n=>{const o={name:n.entityName,key:[],properties:[]};for(const[r,a]of Object.entries(n))if(this.reservedProperties.includes(r)){const d=r;o.properties[d]={name:a.name,type:a.type,nullable:a.nullable===!0}}this.entityTypes.push(o)});s(this,"createEdmModel",()=>this.models);this.schemas=[]}}t.EdmBuilder=i,Object.defineProperty(t,Symbol.toStringTag,{value:"Module"})});
