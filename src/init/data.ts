import * as chromeKeys from '../chrome-storage/keys';
import { changeAppModes } from '../store/appModes/actions';
import store from '../store';

import chromeStorage from 'chrome-storage';
import { readEndpoint } from 'redux-json-api';


export function loadInitialData() {
  // This is our root request that needs to have part of the url (path) hardcoded
  store.dispatch(readEndpoint('/annotations?url=' + window.location.href));
}

export function loadDataFromChromeStorage() {
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

import { API_READ } from 'redux-json-api';
import { createAction, handleActions } from 'redux-actions';
const apiRead = createAction('API_READ');
import mock_response from '../mock_annotations.json';
export function loadMockData() {
  const endpoint = '/annotations';
  const options = {};
  store.dispatch(apiRead({ endpoint, options, ...mock_response }));
}
