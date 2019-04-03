import store from 'content-scripts/store';
import { selectAnnotation } from 'common/store/tabs/tab/api/selectors';
import * as DOMNotifications from '../dom-notifications';
import { selectTab } from 'common/store/tabs/selectors';
import { selectIsStorageInitialized, selectUser } from '../../common/store/storage/selectors';

let instance;

export default {
  init,
  deinit,
};

function init() {
  // subscribe to store changes and return unsubscribe fn
  const unsubscribe = store.subscribe(markLocatedAnnotations);

  // store objects required for later operations
  instance = {
    unsubscribe,
  };
}

function deinit() {
  instance.unsubscribe();
}

// save the annotation location information to DOM for reads in selenium + in console
function markLocatedAnnotations() {
  const state = store.getState();
  const user = selectUser(state);
  const isStorageInitialized = selectIsStorageInitialized(state);
  if (isStorageInitialized && user && selectTab(state).annotations.hasLoaded) {
    const located = selectTab(state).annotations.located.map(location =>
      selectAnnotation(store.getState(), location.annotationId),
    );
    const unlocated = selectTab(state).annotations.unlocated.map(id =>
      selectAnnotation(store.getState(), id),
    );

    if (unlocated.length > 0) {
      console.warn(`${unlocated.length} annotations have not been located`);
    }
    console.info(`${located.length} annotations have been located`);
    DOMNotifications.setAnnotationLocationInfo({ located, unlocated });
  }
}
