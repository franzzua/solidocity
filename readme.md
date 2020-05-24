## Data repository for Solid PODs

* compatible with NodeJS
* Typescript decorators metadata definitions

Really simple:
```javascript
const profile = new Profile(session.webId);
await profile.Init();
console.log(profile.Me.FullName);

profile.Me.Role = 'God of development';
profile.Me.Save();
await profile.Save();
```

Define your models:

```typescript
@document(schema.ProfilePage)
export class Profile extends Document {

    @entityField(Person)
    public Me: Person;

    @entityField(Person, true)
    public OtherPeople: EntitySet<Person>;

}


@entity(schema.Person)
export class Person extends Entity{
    @field(vcard.fn)
    public FullName: string;

    @field(vcard.role)
    public Role: string;
}
```

* supports multiple values and ordered arrays
* supports ACL-files for reading and writing permissions

* **AuthService** for authentication
    * `constructor({idp: Reference, username, password})` with custom user and password
    * `constructor({idp: Reference})` with custom idp - only for Browser
    * `constructor(path: string)` - loads config from file - only for NodeJS
    * `constructor()` - loads config from file `~/.solid-auth-cli-config.json` if in NodeJS

* **Document** base class representing file in POD.
    * `constructor(uri)` - file uri
    * `async Init()` - loads file, on error creates it, on error throws it. All fields of Document will be available after Init.
    * `async Save()` - saves document ot file on POD; on error throws it.
    * `Acl: AclDocument` - control document permissions. By default, they are inherited from parent folder. 

* **Entity** base class representing all values with same Subject in POD file
   * <s>`constructor(uri)`</s> for internal use only
   * `Save()` saves entity changes into document but not to a server
   * `Assign(data)` same as Object.assign
   * `Remvove()` deletes entity from document
   * `Id` entity URI
   * `Document`entity owner

* **EntitySet** used for unordered array of entities
    * `Items: ReadonlyArray<TEntity>` should not be changed by push, pop, unshift etc.
    * `Add(): TEntity` creates new item and adds it to Document

* **ValuesSet** used for ordered array of items (string | References | Date | number)

* **AclDocument**
    * `async InitACL(owner: ownerURI, ...modes: Reference[])` creates new .acl file that grants control,read,write to owner and choosed rights to everybody 

```
@field(predicate, {
    type: 'string' | 'ref' | 'Date' | 'decimal', // string by default
    isArray: boolean, // false by default
    isOrdered: boolean, // false by default
})
```
Decorated field should has type 
- string | Reference | Date | number
- Array<string | Reference | Date | number>
- ValuesSet<string | Reference | Date | number>
It will be initialized on `Document.Init();`
   

  
