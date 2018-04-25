'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


const DEFAULT_HANDLE_MISSING_STYLENAME_OPTION = 'throw';

const isNamespacedStyleName = styleName => {
  return styleName.indexOf('.') !== -1;
};

const getClassNameForNamespacedStyleName = (styleName, styleModuleImportMap, handleMissingStyleNameOption) => {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  const styleNameParts = styleName.split('.');
  const importName = styleNameParts[0];
  const moduleName = styleNameParts[1];
  const handleMissingStyleName = handleMissingStyleNameOption || DEFAULT_HANDLE_MISSING_STYLENAME_OPTION;

  if (!moduleName) {
    if (handleMissingStyleName === 'throw') {
      throw new Error('Invalid style name: ' + styleName);
    } else if (handleMissingStyleName === 'warn') {
      // eslint-disable-next-line no-console
      console.warn('Invalid style name: ' + styleName);
    } else {
      return null;
    }
  }

  if (!styleModuleImportMap[importName]) {
    if (handleMissingStyleName === 'throw') {
      throw new Error('CSS module import does not exist: ' + importName);
    } else if (handleMissingStyleName === 'warn') {
      // eslint-disable-next-line no-console
      console.warn('CSS module import does not exist: ' + importName);
    } else {
      return null;
    }
  }

  if (!styleModuleImportMap[importName][moduleName]) {
    if (handleMissingStyleName === 'throw') {
      throw new Error('CSS module does not exist: ' + moduleName);
    } else if (handleMissingStyleName === 'warn') {
      // eslint-disable-next-line no-console
      console.warn('CSS module does not exist: ' + moduleName);
    } else {
      return null;
    }
  }

  return styleModuleImportMap[importName][moduleName];
};

exports.default = (styleNameValue, styleModuleImportMap, options) => {
  const styleModuleImportMapKeys = Object.keys(styleModuleImportMap);

  const handleMissingStyleName = options && options.handleMissingStyleName || DEFAULT_HANDLE_MISSING_STYLENAME_OPTION;

  return styleNameValue.split(' ').filter(styleName => {
    return styleName;
  }).map(styleName => {
    if (isNamespacedStyleName(styleName)) {
      return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap, handleMissingStyleName);
    }

    if (styleModuleImportMapKeys.length === 0) {
      throw new Error('Cannot use styleName attribute for style name \'' + styleName + '\' without importing at least one stylesheet.');
    }

    const mappedClassNames = styleModuleImportMapKeys.map(importKey => {
      return styleModuleImportMap[importKey][styleName];
    }).filter(Boolean);

    if (mappedClassNames.length > 1) {
      const importKeysWithMatches = styleModuleImportMapKeys.map(importKey => {
        return styleModuleImportMap[importKey][styleName] && importKey;
      }).filter(Boolean);

      throw new Error('Cannot resolve styleName "' + styleName + '" ' + 'because it is present in multiple imports:' + '\n\n\t' + importKeysWithMatches.join('\n\t') + '\n\nYou can resolve this by using a named import, e.g:' + '\n\n\timport foo from "' + importKeysWithMatches[0] + '";' + '\n\t<div styleName="foo.' + styleName + '" />' + '\n\n');
    } else if (mappedClassNames.length === 0) {
      if (handleMissingStyleName === 'throw') {
        throw new Error('Could not resolve the styleName \'' + styleName + '\'.');
      }
      if (handleMissingStyleName === 'warn') {
        // eslint-disable-next-line no-console
        console.warn('Could not resolve the styleName \'' + styleName + '\'.');
      }
    }

    return mappedClassNames[0];
  })

  // Remove any styles which could not be found (if handleMissingStyleName === 'ignore')
  .filter(Boolean).join(' ');
};
//# sourceMappingURL=getClassName.js.map