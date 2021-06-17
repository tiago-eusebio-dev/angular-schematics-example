# Getting Started With Schematics

This repository is a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM.

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

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
