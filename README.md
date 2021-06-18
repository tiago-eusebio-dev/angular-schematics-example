# order-wizard

This repository is a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM.

The package is called `order-wizard` and contains a schematic with the same name: `order-wizard`.

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with:
```bash
schematics --help
```

Run the schematic with:
```bash
rm -rf test-thing
npm run build
schematics .:order-wizard --name="testThing"
```

This will run the schematic without making changes to files (dry-run mode).
To run with dry-run disabled, pass the argument `--dry-run` as false:
```bash
schematics .:order-wizard --name=testThing --dry-run=false
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Making the package available locally

To make the package available globally on the local system so you can use it on an Angular app, simply do:
```bash
npm run build
npm link
```

### Linking the package

In order to use the package on an Angular app, you must link it with the package and then generate the schematic on the app.
Inside the Angular app folder, simply do:
```bash
npm link order-wizard-schematic
ng generate order-wizard-schematic:order-wizard --name=checkout
```
Note that `order-wizard-schematic:order-wizard` follows the rule `package_name:schematics_name` and that `--name` is the required argument to run the schematic, that on this case will create on the app a component called `checkout`.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
