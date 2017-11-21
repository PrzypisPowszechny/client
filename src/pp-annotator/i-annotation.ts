import annotator from 'annotator';

export default interface IAnnotation extends annotator.IAnnotation {
  url?: string;
  fields: IAnnotationFields;
};

export interface IAnnotationFields {
  annotationPriority?: number;
  comment?: string;
  link?: string;
  linkTitle?: string;
  isLinkOnly?: boolean;
}
