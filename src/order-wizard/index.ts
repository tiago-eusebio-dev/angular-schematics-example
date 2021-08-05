import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
  filter,
  SchematicsException,
  chain,
  TaskId,
} from '@angular-devkit/schematics';
import { normalize, strings, workspaces } from '@angular-devkit/core';
import * as ts from 'typescript';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import { NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';

let materialTaskId: TaskId;

/* The entrance point. */
export function orderWizard(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Get the target project's workspace: its angular.json file
    const workspace = getWorkspace(_options, tree);
    // Get the target project name from its workspace/angular.json
    const project = getProject(_options, workspace);
    // Construct the target's app root
    const appRoot = `${project.root}/${project.sourceRoot}/${project.prefix}`;
    // The path on the target project to create the Order Wizard under
    const folderPath = normalize(
      strings.dasherize(`${appRoot}/${_options.path}/${_options.name}`)
    );
    _context.logger.info(`Placing the schematics files on ${folderPath}`);

    // Add schematic files and templates to the target project
    let files = url('./files');
    const newTree = apply(files, [
      // Copies the 'files' folder of the schematics to the folderPath of the target
      move(folderPath),
      template({
        ...strings, // pass the 'strings' module to use in the templates
        ..._options, // values passed on the command line
      }),
      // Filters which files to add/ignore
      specFilter(_options),
    ]);

    const templateRule = mergeWith(newTree, MergeStrategy.Default);
    // Injecting the already copied schematics modules into the target project's root Module
    const updateModuleRule = updateRootModule(_options, workspace);
    // Add dependencies to package.json (add Angular Material dependency) as a scheduled task
    const installMaterialRule = installMaterial();
    // Run an external schematic (to configure Angular Material) as a scheduled task
    const addMaterialRule = addMaterial();

    // Keep the schematic code organized in descrete functions (Rules) instead of cram everything into one Rule.
    // Then, chain all the Rules into one:
    const chainedRule = chain([
      templateRule,
      updateModuleRule,
      installMaterialRule,
      addMaterialRule,
    ]);

    return chainedRule(tree, _context);
  };
}

/* Filter files so they aren't added to the target project */
function specFilter(_options: any): Rule {
  if (_options.spec === 'false') {
    // Don't copy files whose filenames end with '.spec.ts' or '.test.ts'
    return filter((path) => {
      return !path.match(/\.spec\.ts$/) && !path.match(/test\.ts$/);
    });
  }

  // Never copy files whose filenames end with '.test.ts'
  return filter((path) => !path.match(/test\.ts$/));
}

/* Gets the target project's workspace: its angular.json file. */
function getWorkspace(
  _options: any,
  tree: Tree
): workspaces.WorkspaceDefinition {
  const workspace = tree.read('/angular.json');

  if (!workspace) {
    throw new SchematicsException('angular.json file not found!');
  }

  return JSON.parse(workspace.toString());
}

/* Gets the target project name from its workspace/angular.json. */
function getProject(_options: any, workspace: any) {
  _options.project =
    _options.project === 'defaultProject'
      ? workspace.defaultProject
      : _options.project;

  return workspace.projects[_options.project];
}

/* Injects the schematic's modules to the target project's root Module. */
function updateRootModule(_options: any, workspace: any): Rule {
  return (tree: Tree, _context: SchematicContext): Tree => {
    const project = getProject(_options, workspace);
    const schematicsModuleFilename = strings.dasherize(_options.name);
    const schematicsModuleName = strings.classify(_options.name);
    const targetPath = strings.dasherize(_options.path);

    const rootModulePath =
      `${project.root}/` +
      `${project.sourceRoot}/` +
      `${project.prefix}/` +
      `${project.prefix}.module.ts`;

    const importFromPath =
      `'./` +
      `${targetPath ? targetPath + '/' : ''}` +
      `${schematicsModuleFilename}/${schematicsModuleFilename}.module'`;

    const rootModuleFile = getAsSourceFile(tree, rootModulePath);
    const lastImportEndPos = findLastImportEndPos(
      rootModuleFile,
      importFromPath
    );
    const importsArrayEndPos = findImportsArray(
      rootModuleFile,
      schematicsModuleName
    );

    const updateRecorder = tree.beginUpdate(rootModulePath);
    // Add to imports if not already present
    if (lastImportEndPos != -1) {
      updateRecorder.insertLeft(
        lastImportEndPos + 1,
        `import { ${schematicsModuleName}Module } from ${importFromPath}; `
      );
    }

    // Add to @NgModule imports array if not already present
    if (importsArrayEndPos != -1) {
      updateRecorder.insertLeft(
        importsArrayEndPos - 1,
        `, ${schematicsModuleName}Module`
      );
    }
    tree.commitUpdate(updateRecorder);

    return tree;
  };
}

/* Get a file from the tree as a Typescript SourceFile that we can work with to find the correct insertion points */
function getAsSourceFile(tree: Tree, path: string): ts.SourceFile {
  const file = tree.read(path);
  if (!file) {
    throw new SchematicsException(`${path} not found`);
  }

  return ts.createSourceFile(
    path,
    file.toString(),
    ts.ScriptTarget.Latest,
    true
  );
}

/*
 * Find the position of the last 'import' of a file.
 * Returns -1 if the import to add was already imported.
 */
function findLastImportEndPos(
  file: ts.SourceFile,
  importFromPath: string
): number {
  let pos: number = 0;

  file.forEachChild((child: ts.Node) => {
    if (child.kind === ts.SyntaxKind.ImportDeclaration) {
      child.forEachChild((node: ts.Node) => {
        if (
          node.kind === ts.SyntaxKind.StringLiteral &&
          node.getText() === importFromPath
        ) {
          pos = -1;
          return;
        }
        pos = child.end;
      });
    }
  });

  return pos;
}

/*
 * Find the 'imports' array of a @NgModule
 * Returns -1 if the import to add was already imported.
 */
function findImportsArray(
  file: ts.SourceFile,
  schematicsModuleName: string
): number {
  let pos: number = 0;

  file.forEachChild((node: ts.Node) => {
    // find the Module class (AppModule)
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      node.forEachChild((classChild: ts.Node) => {
        // find the Module's Decorator (@NgModule)
        if (classChild.kind === ts.SyntaxKind.Decorator) {
          classChild.forEachChild((moduleDeclaration: ts.Node) => {
            moduleDeclaration.forEachChild((objectLiteral: ts.Node) => {
              objectLiteral.forEachChild((property: ts.Node) => {
                // find the 'imports' property
                if (property.getFullText().includes('imports')) {
                  if (
                    property
                      .getFullText()
                      .includes(`${schematicsModuleName}Module`)
                  ) {
                    pos = -1;
                    return;
                  }
                  pos = property.end;
                }
              });
            });
          });
        }
      });
    }
  });

  return pos;
}

/*
 * Adds dependencies to package.json, validating if they doesn't exist already.
 * It is exported so we can test the Scheduled Task.
 */
export function installMaterial(): Rule {
  return (tree: Tree, _context: SchematicContext): Tree => {
    const packageJsonPath = '/package.json';
    const materialDepName = '@angular/material';
    const packageJson = getAsSourceFile(tree, packageJsonPath);
    let materialInstalled = false;

    packageJson.forEachChild((node: ts.Node) => {
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node.forEachChild((objectLiteral) => {
          objectLiteral.forEachChild((property) => {
            if (property.getFullText().includes('dependencies')) {
              property.forEachChild((dependency) => {
                if (dependency.getFullText().includes(materialDepName)) {
                  _context.logger.info('Angular Material already installed');
                  materialInstalled = true;
                }
              });
            }
          });
        });
      }
    });

    if (!materialInstalled) {
      const options = <NodePackageTaskOptions>{
        packageName: materialDepName,
      };
      materialTaskId = _context.addTask(new NodePackageInstallTask(options));
      _context.logger.info('Installing Angular Material...');
    }

    return tree;
  };
}

/* Configures Angular Material after its installation. */
function addMaterial(): Rule {
  return (tree: Tree, _context: SchematicContext): Tree => {
    const options = {
      theme: 'indigo-pink',
      gestures: true,
      animations: true,
    };

    if (materialTaskId) {
      _context.addTask(
        new RunSchematicTask('@angular/material', 'ng-add', options),
        [materialTaskId]
      );
      _context.logger.info('Configuring Angular Material...');
    }

    return tree;
  };
}
