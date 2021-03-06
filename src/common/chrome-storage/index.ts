import _filter from 'lodash/filter';

import { AppModes } from 'common/store/tabs/tab/appModes/types';
import { standardizeUrlForPageSettings } from 'common/url';

import * as chromeKeys from './keys';

// Firefox fix for chrome global interface
interface CustomWindow extends Window {
  chrome: any;
}

declare let window: CustomWindow;
window.chrome = window.chrome || {};

export function turnOffAnnotationMode(appModes: AppModes, currentTabUrl: string) {
  const currentStandardizedTabUrl = standardizeUrlForPageSettings(currentTabUrl);
  const newAnnotationModePages = _filter(appModes.annotationModePages, url => url !== currentStandardizedTabUrl);
  chrome.storage.local.set({ [chromeKeys.ANNOTATION_MODE_PAGES]: newAnnotationModePages });
}
