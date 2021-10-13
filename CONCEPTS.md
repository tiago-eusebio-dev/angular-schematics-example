# Concepts

### Purpose

A schematic is used to generate and/or edit files on an Angular project.
With a schematic you can, for example, bootstrap an Angular app adding some components, importing those components, etc.

### Schematics definition

A schematics project can have multiple schematics to run.
All these schematics must be defined on `src/collection.json`:
```json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "order-wizard": {
      "description": "A schematic for creating an order wizard using the Angular Material Stepper component.",
      "factory": "./order-wizard/index#orderWizard",
      "schema": "./order-wizard/schema.json"
    }
  }
}
```

### Factories, Rules and Trees

* A **Factory** is the entry point of a schematic and what makes it to be executed. A Factory always returns a **Rule** or chain of **Rule**s.
* A **Rule** is the result of a function which changes the project's files by accessing its filesystem, called as **Tree**. We can have multiple Rules that will be chained by the Factory.
* A **Tree** represents the filesystem that the schematics will access.