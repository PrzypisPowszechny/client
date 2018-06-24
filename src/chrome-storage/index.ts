import { AppModeReducer } from '../store/appModes/reducers';
import _filter from 'lodash/filter';
import * as chromeKeys from './keys';
import { standardizeURL } from 'utils/url';

let storage;

if (PP_SETTINGS.DEV) {
  storage = chrome.storage.local;
} else {
  // Saves to this storage go to Google servers and are synced between many Google sessions on different PCs.
  storage = chrome.storage.sync;
}

export default storage;

export function turnOffAnnotationMode(appModes: AppModeReducer) {
  const currentStandardizedURL = standardizeURL(window.location.href);
  const newAnnotationModePages = _filter(appModes.annotationModePages, url => url !== currentStandardizedURL)
  storage.set({ [chromeKeys.ANNOTATION_MODE_PAGES]: newAnnotationModePages });
}
