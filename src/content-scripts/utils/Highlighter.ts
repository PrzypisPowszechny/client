import $ from 'jquery';
import { Range as XPathRange } from 'xpath-range';

import { PPHighlightClass, PPHighlightIdAttr } from 'content-scripts/settings';

import { AnnotationRequestResourceType } from '../../common/api/annotation-requests';
import { AnnotationResourceType } from '../../common/api/annotations';
import { APIModel } from '../../common/api/json-api';

/**
 * highlightRange wraps the DOM Nodes within the provided range with a highlight
 * element of the specified class and returns the highlight Elements.
 *
 * normedRange - A NormalizedRange to be highlighted.
 * cssClass - A CSS class to use for the highlight
 *
 * Returns an array of highlight Elements.
 */
function highlightRange(normedRange, cssClass) {
  const white = /^\s*$/;

  /*
   Ignore text nodes that contain only whitespace characters. This prevents
   spans being injected between elements that can only contain a restricted
   subset of nodes such as table rows and lists. This does mean that there
   may be the odd abandoned whitespace node in a paragraph that is skipped
   but better than breaking table layouts.
   */
  const nodes = normedRange.textNodes();
  const results = [];
  for (const node of nodes) {
    if (!white.test(node.nodeValue)) {
      const hl = document.createElement('span');
      hl.className = cssClass;
      node.parentNode.replaceChild(hl, node);
      hl.appendChild(node);
      results.push(hl);
    }
  }
  return results;
}

/**
 * reanchorRange will attempt to normalize a range, swallowing XPathRange.RangeErrors
 * for those ranges which are not reanchorable in the current document.
 */
function reanchorRange(range, rootElement): XPathRange.NormalizedRange {
  const sniffedRange = XPathRange.sniff(range);
  if (sniffedRange) {
    try {
      return sniffedRange.normalize(rootElement);
    } catch (e) {
      if (!(e instanceof XPathRange.RangeError)) {
        // Oh Javascript, why you so crap? This will lose the traceback.
        throw(e);
      }
    }
  }
  /*
    Otherwise, we simply swallow the error. Callers are responsible
    for only trying to draw valid annotations.
    */
  return null;
}

export interface IHighlightRegistry {
  [id: string]: {
    normedId: string;
    range: ISerializedRange;
    annotationData: any;
    highlightElements: HTMLElement[];
  };
}

// pure SerializedRange object with no assumptions on methods
export interface ISerializedRange {
  start: string;
  startOffset: number;
  end: string;
  endOffset: number;
}

interface IHighlightDrawArgs {
  id: number | string;
  range: ISerializedRange;
  annotationData: any;
}

/**
 * Highlighter provides a simple way to draw highlighted <span> tags over
 * annotated ranges within a document.
 *
 * It is PP's adaption of annotator's Highlighter
 * todo: replace jquery with pure js
 */
export default class Highlighter {

  static defaultOptions = {
    // The CSS class to apply to drawn highlights
    highlightClass: PPHighlightClass,
    highlightIdAttr: PPHighlightIdAttr,
    // Number of annotations to draw at once
    chunkSize: 10,
    // Time (in ms) to pause between drawing chunks of annotations
    chunkDelay: 10,

    namespace: 'PPHighlighter',
  };

  static coerceId(id: number | string) {
    return id.toString();
  }

  element;
  options;
  highlightRegistry: IHighlightRegistry;

  constructor(element, options?) {
    this.element = element;
    this.options = {
      ...Highlighter.defaultOptions,
      ...options,
    };
    this.highlightRegistry = {};
  }

  /**
   * Public: Draw highlights for all the given annotations
   *
   * annotations - An Array of annotation Objects for which to draw highlights.
   *
   * Returns nothing.
   */
  drawAll = (annotations: IHighlightDrawArgs[]) => {
    return new Promise((resolve) => {
      let highlights = [];

      const loader = (annList = []) => {
        const now = annList.splice(0, this.options.chunkSize);
        for (const el of now) {
          highlights = highlights.concat(this.draw(el.id, el.range, el.annotationData));
        }

        // If there are more to do, do them after a delay
        if (annList.length > 0) {
          setTimeout(() => {
            loader(annList);
          }, this.options.chunkDelay);
        } else {
          resolve(highlights);
        }
      };

      loader(annotations.slice());
    });
  }

  undrawAll = () => {
    for (const normedId of Object.keys(this.highlightRegistry)) {
      this.undraw(normedId);
    }
  }

  /**
   * Public: Draw highlights for the annotation.
   *
   * annotation - An annotation Object for which to draw highlights.
   *
   *  Returns an Array of drawn highlight elements.
   */
  draw = (id: number | string, range: ISerializedRange, annotationData: any) => {
    const normedRange = reanchorRange(range, this.element);
    if (!normedRange) {
      return null;
    }
    const highlightElements = highlightRange(normedRange, this.options.highlightClass);
    const normedId = Highlighter.coerceId(id);

    // If this id has a highlight already, first remove it from DOM
    if (normedId in this.highlightRegistry) {
      this.undraw(normedId);
    }
    const annotationRecord = {
      normedId,
      range,
      annotationData,
      highlightElements,
    };
    this.highlightRegistry[normedId] = annotationRecord;
    $(highlightElements).attr(this.options.highlightIdAttr, normedId);
    return Object.assign({}, annotationRecord);
  }

  /**
   * Set a handler for events related to highlight elements
   *
   * event - HTML event to subscribe to such as mouseover, mouseleave, etc...
   */
    // todo (nice to have): rewrite it to pure js
  onHighlightEvent = (
    event: string,
    handler: (e: any, annotationData: any[]) => void,
  ) => {

    $(this.element)
      .on(event + '.' + this.options.nameSpace, '.' + this.options.highlightClass, (e) => {
        const annotations = $(e.target)
          .parents('.' + this.options.highlightClass)
          .addBack()
          .map((_, elem) => {
            return $(elem).attr(this.options.highlightIdAttr);
          })
          .toArray()
          .map(id => this.highlightRegistry[id.toString()].annotationData);
        handler(e, annotations);
      });
  }

  /**
   * Public: Remove the drawn highlights for the given annotation.
   *
   * annotation - An annotation Object for which to purge highlights.
   *
   * Returns nothing.
   */
  undraw = (id: number | string) => {
    const normedId = Highlighter.coerceId(id);
    const data = this.highlightRegistry[normedId];

    for (const highlight of data.highlightElements) {
      if (highlight.parentNode !== null) {
        $(highlight).replaceWith(highlight.childNodes as any); // ugly "as any" type fix (no idea what's wrong)
      }
    }
    delete this.highlightRegistry[normedId];
  }

  scrollToHighlight = (id: number | string) => {
    const normedId = Highlighter.coerceId(id);
    const data = this.highlightRegistry[normedId];
    // Take an arbitrary first span (there are hardly any multiline annotations anyway)
    if (!data) {
      throw new Error('Annotation has not been rendered and may not be scrolled to');
    }
    data.highlightElements[0].scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }

  /**
   * Public: Redraw the highlights for the given annotation.
   *
   * annotation - An annotation Object for which to redraw highlights.
   *
   * Returns the list of newly-drawn highlights.
   */
  redraw = (id: number | string, range: ISerializedRange, annotationData: any) => {
    this.undraw(id);
    return this.draw(id, range, annotationData);
  }

  // todo (nice to have): rewrite it to pure js
  destroy = () => {
    $(this.element)
      .find('.' + this.options.highlightClass)
      .each((_, el) => {
        $(el).contents().insertBefore(el);
        $(el).remove();
      });
  }
}

// tslint:disable-next-line:no-shadowed-variable
export function instanceToHighlightId(instance: APIModel) {
  /*
   * Get unique id for an instance of an object that should be highlighted in text
   * Highlighter indexes highlighted objects by id
   */
  return resourceToHighlightId(instance.type, instance.id);
}

export function resourceToHighlightId(resourceType: string, id: string) {
  const allowedTypes = [AnnotationResourceType, AnnotationRequestResourceType];
  if (allowedTypes.indexOf(resourceType) === -1) {
    throw new Error(
      `Generating unique highlighter id for an instance that cannot be highlighted (type: ${resourceType})`,
    );
  }
  return resourceToUniqueId(resourceType, id);
}

const resourceToUniqueId = (resourceType: string, id: string) => `${resourceType}:${id}`;
