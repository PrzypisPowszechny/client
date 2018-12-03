import { Range as XPathRange } from 'xpath-range';

import 'rangy/lib/rangy-classapplier';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-textrange';
import 'rangy/lib/rangy-serializer';
import rangy from 'rangy';

import mousePosition from '../utils/mousePosition';
import store from 'content-scripts/store';
import { makeSelection, showMenu } from 'content-scripts/store/actions';

import { TextSelector } from '../utils/index';
import { hideMenu } from 'content-scripts/store/widgets/actions';
import {
  outsideArticleClasses,
  PPHighlightClass,
  annotationRootNode,
  quoteContextWidth,
} from 'content-scripts/settings';
import { selectModeForCurrentPage } from '../store/appModes/selectors';
import { setSelectionRange, showEditorAnnotation } from '../store/widgets/actions';
import ppGA from 'common/pp-ga';
import axios from 'axios';
import { saveAnnotationRequest } from '../../common/api/utils';

let handlers;

export default {
  init,
  deinit,
};

export interface AnnotationLocation {
  range: XPathRange.SerializedRange;
  quote: string;
  quoteContext: string;
}

function init() {
  const selector = new TextSelector(annotationRootNode(), {
    onSelectionChange: selectionChangeCallback,
    outsideArticleClasses,
  });

  handlers = {
    selector,
  };

  chrome.runtime.onMessage.addListener(contextMenuCallback);

  // This special hook for selenium e2e test to open editor as context menu click is out of selenium's control...
  document.addEventListener('EMULATE_ON_CONTEXT_MENU_ANNOTATE', annotateCommand);
  document.addEventListener('EMULATE_ON_CONTEXT_MENU_ANNOTATION_REQUEST', annotationRequestCommand);
}

export function deinit() {
  chrome.runtime.onMessage.removeListener(contextMenuCallback);
  // (todo) deinitialize TextSelector
}

function selectionChangeCallback(
  selectedRanges: XPathRange.NormalizedRange[],
  isInsideArticle: boolean,
  event) {

  const appModes = selectModeForCurrentPage(store.getState());
  // Show the "add annotation" menu if in the annotation mode
  if (appModes.isAnnotationMode) {
    if (selectedRanges.length === 0 || (selectedRanges.length === 1 && !isInsideArticle)) {
      // Propagate to the store only selections fully inside the article (e.g. not belonging to any of PP components)
      // When we need to react also to other, we can easily expand the textSelector reducer; for now it' too eager.
      store.dispatch(makeSelection(null));
      store.dispatch(hideMenu());
    } else if (selectedRanges.length === 1) {
      store.dispatch(makeSelection(fullAnnotationLocation(selectedRanges[0])));
      store.dispatch(showMenu(mousePosition(event)));
    } else {
      console.warn('PP: more than one selected range is not supported');
    }
  }
}

function contextMenuCallback(request, sender) {
  if (request.action === 'ANNOTATE') {
    annotateCommand();
  }
  if (request.action === 'ANNOTATION_REQUEST') {
    annotationRequestCommand();
  }
}

function tryGetSingleSelection() {
  const selection = handlers.selector.captureDocumentSelection();
  if (selection.length === 1) {
    return selection[0];
  } else if (selection.length > 1) {
    console.warn('PP: more than one selected range is not supported');
    return null;
  }
}

function annotationRequestCommand() {
  const selection = tryGetSingleSelection();
  if (selection) {
    const currentUrl = window.location.href;
    const annotationLocation = fullAnnotationLocation(selection);
    saveAnnotationRequest({
      url: currentUrl,
      quote: annotationLocation.quote
    }).then((response) => {
      // TODO notify
      console.log('annotation request sent!');
    });
  }
}

function annotateCommand() {
  /*
   * For now, do not check for being inside article.
   * Reason: checking ContextMenu API selection for being insideArticle is possible, but uncomfortable,
   * as context menu actions are handled in the separate background script.
   */
  const selection = tryGetSingleSelection();
  if (selection) {
    const annotationLocation = fullAnnotationLocation(selection);
    store.dispatch(setSelectionRange(annotationLocation));
    const selectionCenter = handlers.selector.currentSingleSelectionCenter();
    store.dispatch(showEditorAnnotation(selectionCenter.x, selectionCenter.y));
    ppGA.annotationAddFormDisplayed('rightMouseContextMenu');
  }
}

function XPathNormalizedRangeToRangyRange(xPathRange: XPathRange.NormalizedRange) {
  const rangyRange = rangy.createRange();
  const textNodes = xPathRange.textNodes();
  rangyRange.setStartBefore(textNodes[0]);
  rangyRange.setEndAfter(textNodes[textNodes.length - 1]);
  return rangyRange;
}

function fullAnnotationLocation(normalizedRange: XPathRange.NormalizedRange): AnnotationLocation {
  const rangyRange = XPathNormalizedRangeToRangyRange(normalizedRange);
  const quote = rangyRange.text();
  rangyRange.moveStart('character', -quoteContextWidth);
  rangyRange.moveEnd('character', quoteContextWidth);
  const quoteContext = rangyRange.text();
  return {
    range: normalizedRange.serialize(annotationRootNode(), `.${PPHighlightClass}`),
    quote,
    quoteContext,
  };
}
