import annotator from 'annotator';

export interface IAnnotationBase extends annotator.IAnnotation {
  url?: string;
};

export interface IAnnotationFields {
  annotationPriority?: number;
  comment?: string;
  link?: string;
  linkTitle?: string;
};

type IAnnotation = IAnnotationBase & IAnnotationFields;

export default IAnnotation;