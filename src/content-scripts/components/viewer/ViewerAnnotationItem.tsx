import React from 'react';
import { link } from 'react-icons-kit/icomoon/link';
import { Icon } from 'react-icons-kit/Icon';
import { connect } from 'react-redux';

import classNames from 'classnames';
import moment from 'moment';

import {
  AnnotationAPIModel,
  AnnotationDemagogCategories,
  annotationDemagogCategoriesLabels,
  AnnotationPPCategories,
  annotationPPCategoriesLabels,
  AnnotationPublishers,
} from 'common/api/annotations';
import ppGa from 'common/pp-ga';
import { selectAnnotation } from 'common/store/tabs/tab/api/selectors';
import { hideViewer } from 'common/store/tabs/tab/widgets/actions';
import { extractMinimalLabel, httpPrefixed } from 'common/url';

import AuthorActionControls from './viewer-elements/AuthorActionControls';
import UserActionControls from './viewer-elements/UserActionControls';
import styles from './ViewerItem.scss';

import { E2E_ANNOTATION_CLASS } from '../../../../e2e/shared/classes';

interface IViewerAnnotationItemProps {
  key: string;
  annotationId: string;

  annotation: AnnotationAPIModel;
  hideViewer: () => undefined;
}

@connect(
  (state, props) => ({
    annotation: selectAnnotation(state, props.annotationId),
  }), {
    hideViewer,
  },
)
export default class ViewerAnnotationItem extends React.Component<Partial<IViewerAnnotationItemProps>, {}> {

  static defaultState = {};

  static ppCategoryToClass(ppCategory) {
    const ppCategoryToClass = {
      [AnnotationPPCategories.ADDITIONAL_INFO]: styles.categoryAdditionalInfo,
      [AnnotationPPCategories.CLARIFICATION]: styles.categoryClarification,
      [AnnotationPPCategories.ERROR]: styles.categoryError,
    };
    return ppCategoryToClass[ppCategory];
  }

  static demagogCategoryToClass(demagogCategory) {
    const ppCategoryToClass = {
      [AnnotationDemagogCategories.TRUE]: styles.dgCategoryTrue,
      [AnnotationDemagogCategories.PTRUE]: styles.dgCategoryTrue,
      [AnnotationDemagogCategories.FALSE]: styles.dgCategoryFalse,
      [AnnotationDemagogCategories.PFALSE]: styles.dgCategoryFalse,
      [AnnotationDemagogCategories.LIE]: styles.dgCategoryLie,
      [AnnotationDemagogCategories.UNKNOWN]: styles.dgCategoryUnknown,
    };
    return ppCategoryToClass[demagogCategory];
  }

  constructor(props: IViewerAnnotationItemProps) {
    super(props);
    this.state = ViewerAnnotationItem.defaultState;
  }

  componentDidMount() {
    const { ppCategory, comment, annotationLink } = this.props.annotation.attributes;
    ppGa.annotationDisplayed(this.props.annotationId, ppCategory, !comment, annotationLink);
  }

  handleAnnotationLinkClick = () => {
    const { ppCategory, comment, annotationLink } = this.props.annotation.attributes;
    this.props.hideViewer();
    ppGa.annotationLinkClicked(this.props.annotationId, ppCategory, !comment, annotationLink);
  }

  render() {
    const {
      comment,
      annotationLink,
      annotationLinkTitle,
      createDate,
      ppCategory,
      demagogCategory,
      doesBelongToUser,
      publisher,
    } = this.props.annotation.attributes;

    return (
      <li className={classNames(styles.self, styles.annotation, E2E_ANNOTATION_CLASS)}>
        <div className={styles.headBar}>
          <div>
            <div className={classNames(styles.header, ViewerAnnotationItem.ppCategoryToClass(ppCategory))}>
              {comment ? annotationPPCategoriesLabels[ppCategory] : 'źródło'}
            </div>
            <div className={styles.commentDate}>
              {createDate ? moment(createDate).fromNow() : ''}
            </div>
          </div>
          <div className={styles.publisherInfo}>
            {publisher === AnnotationPublishers.DEMAGOG &&
            <a className={styles.publisherDemagog} href={'http://demagog.org.pl/'} target="_blank">
              <span className={styles.publisherName}>Dodane przez Demagoga</span>
              <span className={styles.publisherIcon}/>
            </a>
            }
            {publisher === AnnotationPublishers.PP && doesBelongToUser &&
            <AuthorActionControls annotation={this.props.annotation}/>
            }
          </div>
        </div>
        {!comment ? '' :
          <div className={styles.comment}>
            {publisher === AnnotationPublishers.DEMAGOG &&
            <span
              className={classNames(styles.demagogCategory,
                ViewerAnnotationItem.demagogCategoryToClass(demagogCategory))}
            >
                  {annotationDemagogCategoriesLabels[demagogCategory]}
            </span>
            }
            {comment}
          </div>
        }
        <div className={styles.bottomBar}>
          <div className={styles.annotationLinkContainer}>
            <a
              className={styles.annotationLink}
              href={httpPrefixed(annotationLink)}
              onClick={this.handleAnnotationLinkClick}
              target="_blank"
            >
              <Icon className={styles.annotationLinkIcon} icon={link} size={11}/>
              {extractMinimalLabel(annotationLink)}
            </a>
            <a
              className={styles.annotationLinkTitle}
              href={httpPrefixed(annotationLink)}
              onClick={this.handleAnnotationLinkClick}
              target="_blank"
            >
              {annotationLinkTitle}
            </a>
          </div>
          <UserActionControls
            annotation={this.props.annotation}
          />
        </div>
      </li>
    );
  }
}
