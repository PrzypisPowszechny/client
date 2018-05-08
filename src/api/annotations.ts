import {AnnotationPriorities} from 'components/consts';

export interface RangeAPIModel {
  start: string;
  startOffset: number;
  end: string;
  endOffset: number;
}

export interface AnnotationAPICreateModel {
  type: string;
  attributes: {
    url: string;
    range: RangeAPIModel;
    priority: AnnotationPriorities;
    comment: string;
    annotationLink: string;
    annotationLinkTitle: string;
  };
}

export interface AnnotationAPIModel {
  id: string;
  type: string;
  attributes: {
    url: string;
    range: RangeAPIModel;
    priority: AnnotationPriorities;
    comment: string;
    annotationLink: string;
    annotationLinkTitle: string;
    upvote: boolean;
    upvoteCount: number;
    doesBelongToUser: boolean;
  };
}
