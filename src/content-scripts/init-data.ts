import * as chromeKeys from 'common/chrome-storage/keys';
import { changeAppModes } from './store/appModes/actions';
import store from './store';

import chromeStorage from 'common/chrome-storage';
import { readEndpoint } from 'redux-json-api';

export function loadFromAPI() {
  // This is our root request that needs to have part of the url (path) hardcoded
  store.dispatch(readEndpoint('/annotations?url=' + window.location.href));
}

export function loadFromChromeStorage() {
  return new Promise((resolve, reject) => {
    chromeStorage.get([
      chromeKeys.ANNOTATION_MODE_PAGES,
      chromeKeys.DISABLED_EXTENSION,
      chromeKeys.DISABLED_PAGES,
    ], (result) => {
      const newAppModes = {
        annotationModePages: result[chromeKeys.ANNOTATION_MODE_PAGES] || [],
        isExtensionDisabled: result[chromeKeys.DISABLED_EXTENSION] || false,
        disabledPages: result[chromeKeys.DISABLED_PAGES] || [],
      };
      store.dispatch(changeAppModes(newAppModes));
      resolve();
    });
  });
}