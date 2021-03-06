import FieldsObject = UniversalAnalytics.FieldsObject;
import { isGaRunningInWindow, sendEvent as bgSendEvent } from './bg';
import { EventOptions } from './types';

export function sendEvent(fieldsObject: FieldsObject, options: EventOptions = {}) {
  if (isGaRunningInWindow()) {
    // Bypass sending message if we are already in background page
    bgSendEvent(fieldsObject, options).then( () => null);
  } else {
    if (!options.location && window.location.href.startsWith('http')) {
      options.location = window.location.href;
    }
    chrome.runtime.sendMessage({ action: 'SEND_GA_EVENT', fieldsObject, options });
  }
}
