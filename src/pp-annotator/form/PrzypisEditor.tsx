import * as React from 'react';
import * as ReactDOM from "react-dom";

import AnnotationForm from './AnnotationForm';

import { util, ui as AnnotatorUI } from 'annotator';
import { mover, resizer } from "./editor-utils";
import IAnnotation, { IAnnotationFields } from '../i-annotation';

const { $ } = util;
const { widget: { Widget } } = AnnotatorUI;

/**
 * annotator.ui.editor.Editor extension
 * - without Editor field add and load mechanism (and React-rendered form)
 *
 * Css and show/hide functionality of the outer editor container is nevertheless inherited.
 */

export default class PrzypisEditor extends Widget {
  static classes = {
    hide: 'annotator-hide',
    focus: 'annotator-focus',
    invert: Widget.classes.invert,
  };
  static template = `
  <div class="annotator-outer annotator-editor annotator-hide">
    <div id="react-form-slot"></div>
  </div>`;

  fields: string[];
  annotation: IAnnotation;
  promiseResultContainer?: {
    resolve;
    reject;
  }
  resizer: {
    destroy: () => void;
  }
  mover: {
    destroy: () => void;
  }

  constructor(options) {
    super(options);

    this.fields = [];
    this.annotation = {}

    // jquery mouse action listeners from annotator module have been left out;
    // see annotator.ui.editor's constructor
  }

  /**
   * Returns an unresolved Promise that will be resolved when the save/cancel button is clicked.
   * If load function is waited upon, it will finish only when the save/cancel button is clicked.
   */
  load = (annotation, position) => {
    this.annotation = annotation;
    this.updateForm(annotation.fields);

    return new Promise((resolve, reject) => {
      this.promiseResultContainer = {
        resolve,
        reject
      };
      this.show(position);
    });
  }

  /**
   * When save button is clicked, React form field value dictionary will be passed to this function
   */
  save = (fields: IAnnotationFields) => {
    // Load field values from component props
    this.annotation.fields = fields;

    // Resolve deferred promise; will result in asynchronous user input
    if (this.promiseResultContainer) {
      this.promiseResultContainer.resolve(this.annotation);
    }
    this.hide();
  }

  /**
   * Renders (or updates, if already rendered) React component within the Editor html container
   */
  updateForm = (fields) => {
    ReactDOM.render(
      <AnnotationForm id={this.annotation.id} fields={fields || {}} onSave={this.save} onCancel={this.cancel}/>,
      document.getElementById('react-form-slot')
    );
  }

  /**
   * Public: Cancels the editing process, discarding any edits made to the
   * annotation.
   */
  cancel = () => {
    if (this.promiseResultContainer) {
      this.promiseResultContainer.reject('editing cancelled');
    }
    this.hide();
  }

  /**
   * Public: Show the editor.
   *
   * position - An Object specifying the position in which to show the editor
   * (optional).
   *
   * Examples
   *
   * editor.show()
   * editor.hide()
   * editor.show({top: '100px', left: '80px'})
   *
   * Returns nothing.
   */
  show = (position) => {
    if (position) {
      this.element.css({
        top: position.top,
        left: position.left
      });
    }

    this.element
      .find('.annotator-save')
      .addClass(PrzypisEditor.classes.focus);

    super.show();

    // give main textarea focus
    this.element.find(":input:first").focus();

    this.setupDraggables();
  }

  /**
   * Override parent attach function to render React form
   */
  attach = () => {
    // Call parent function (renders PrzypisEditor.template)
    super.attach();
    this.updateForm({});
  }

  /**
   * Sets up mouse events for resizing and dragging the editor window.
   *
   * Returns nothing.
   */
  setupDraggables() {
    if (this.resizer) {
      this.resizer.destroy();
    }
    if (this.mover) {
      this.mover.destroy();
    }

    this.element.find('.annotator-resize').remove();

    // Find the first/last item element depending on orientation
    let cornerItem;
    if (this.element.hasClass(PrzypisEditor.classes.invert.y)) {
      cornerItem = this.element.find('.annotator-item:last');
    } else {
      cornerItem = this.element.find('.annotator-item:first');
    }

    if (cornerItem) {
      $('<span class="annotator-resize"></span>').appendTo(cornerItem);
    }

    const controls = this.element.find('.annotator-controls')[0],
      textarea = this.element.find('textarea:first')[0],
      resizeHandle = this.element.find('.annotator-resize')[0];

    this.resizer = resizer(textarea, resizeHandle, {
      invertedX: () => this.element.hasClass(PrzypisEditor.classes.invert.x),
      invertedY: () => this.element.hasClass(PrzypisEditor.classes.invert.y),
    });

    this.mover = mover(this.element[0], controls);
  }
}