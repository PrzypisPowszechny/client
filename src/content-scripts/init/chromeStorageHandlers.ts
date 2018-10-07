import * as chromeKeys from 'common/chrome-storage/keys';
import { changeAppModes } from '../store/appModes/actions';
import store from '../store';
import { AppModes } from 'content-scripts/store/appModes/types';
import chromeStorage from 'common/chrome-storage';

const storageKeysToAppMode = {
  [chromeKeys.DISABLED_EXTENSION]: 'isExtensionDisabled',
  [chromeKeys.ANNOTATION_MODE_PAGES]: 'annotationModePages',
  [chromeKeys.DISABLED_PAGES]: 'disabledPages',
};

export default function initializeChromeStorageHandlers() {
  chromeStorage.onChanged.addListener((changes, namespace) => {
    for (const key of Object.keys(changes)) {
      if (storageKeysToAppMode[key]) {
          store.dispatch(
          changeAppModes({ [storageKeysToAppMode[key]]: changes[key].newValue } as AppModes),
        );
      }
    }
  });
}
