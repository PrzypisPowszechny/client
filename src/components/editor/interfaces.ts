import {AnnotationPriorities} from '../consts';

export interface IEditorForm {
  annotationId: number;
  priority: AnnotationPriorities;
  comment: string;
  referenceLink: string;
  referenceLinkTitle: string;
}

export interface IEditorProps extends IEditorForm {
  visible: boolean;
  invertedX: boolean;
  invertedY: boolean;
  locationX: number;
  locationY: number;
  /*
   * calculateInverted - (overwrites invertedX and invertedY)
   * if true, the widget horizontal or vertical inversion will be calculated based on the window location
   * after the component is rendered for the first time after prop change
   */
  calculateInverted: boolean;
  editor: any;
}

export interface IEditorState extends IEditorForm {
  locationX: number;
  locationY: number;
  calculateInverted: boolean;

  isDragged: boolean;
  noCommentModalOpen: boolean;

  referenceLinkError: string;
  referenceLinkTitleError: string;
}