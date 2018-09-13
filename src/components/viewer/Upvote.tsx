import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { createResource, deleteResource, readEndpoint } from 'redux-json-api';
import { Popup } from 'semantic-ui-react';

import styles from './Viewer.scss';
import { AnnotationResourceType, AnnotationAPIModel } from 'api/annotations';
import {
  AnnotationUpvoteResourceType, AnnotationUpvoteAPIModel, AnnotationUpvoteAPICreateModel,
} from 'api/annotation-upvotes';
import { PPScopeClass } from '../../class_consts';
import ppGA from 'pp-ga';

interface IUpvoteProps {
  indirectChildClassName: string;

  annotation: AnnotationAPIModel;
  upvote: AnnotationUpvoteAPIModel;

  fetchUpvote: (url: string) => Promise<object>;
  deleteUpvote: (instance: AnnotationUpvoteAPIModel) => Promise<object>;
  createUpvote: (instance: AnnotationUpvoteAPICreateModel) => Promise<object>;
}

interface IUpvoteState {
  isFetchingUpvote: boolean;
}

@connect(
  (state, props) => ({
    upvote: props.annotation.relationships.annotationUpvote.data ? state.api.annotationUpvotes.data.find(
      upvote => upvote.id === props.annotation.relationships.annotationUpvote.data.id,
    ) : null,
  }),
  dispatch => ({
    fetchUpvote: (url: string) => dispatch(readEndpoint(url)),
    deleteUpvote: (instance: AnnotationUpvoteAPIModel) => dispatch(deleteResource(instance)),
    createUpvote: (instance: AnnotationUpvoteAPICreateModel) => dispatch(createResource(instance)),
  }),
)
export default class Upvote extends React.Component<Partial<IUpvoteProps>, Partial<IUpvoteState>> {

  constructor(props: IUpvoteProps) {
    super(props);

    if (props.annotation.relationships.annotationUpvote.data && !props.upvote) {
      props.fetchUpvote(props.annotation.relationships.annotationUpvote.links.related).then(
        () => this.setState({ isFetchingUpvote: false }),
      ).catch(() => null);
      this.state =  { isFetchingUpvote: true };
    } else {
      this.state = {};
    }
  }

  toggleUpvote = (e) => {
    const { annotation, upvote } = this.props;
    const { attributes: attrs } =  annotation;
    if (upvote) {
      this.props.deleteUpvote(upvote).then(() => {
        ppGA.annotationUpvoteCancelled(annotation.id, attrs.priority, !attrs.comment, attrs.annotationLink);
      }).catch((errors) => {
        console.log(errors);
      });
    } else {
      this.props.createUpvote({
        type: AnnotationUpvoteResourceType,
        relationships: {
          annotation: {
            data: {
              id: annotation.id,
              type: AnnotationResourceType,
            },
          },
        },
      }).then(() => {
        ppGA.annotationUpvoted(annotation.id, attrs.priority, !attrs.comment, attrs.annotationLink);
      }).catch((errors) => {
        console.log(errors);
      });
    }
  }

  renderUpvoteButton() {
    const { annotation } = this.props;
    const { annotationUpvote } = annotation.relationships;
    const totalUpvoteCount = annotation.attributes.upvoteCountExceptUser + (annotationUpvote.data ? 1 : 0);
    return (
      <a
        className={classNames('ui', styles.upvote, {
          [styles.selected]: Boolean(annotationUpvote.data),
        })
        }
        onClick={this.toggleUpvote}
      >
        <span className={styles.number}>{totalUpvoteCount}</span>
        <span className={styles.upvoteIcon}/>
      </a>
    );
  }

  render() {
    const {
      indirectChildClassName,
    } = this.props;

    return this.state.isFetchingUpvote ? null : (
        <div className={styles.ratings}>
          <Popup
            trigger={this.renderUpvoteButton()}
            size="small"
            className={classNames(indirectChildClassName, PPScopeClass, styles.popup, 'pp-popup-small-padding')}
            inverted={true}
          >
            Daj znać, że uważasz przypis za pomocny.
          </Popup>
        </div>
    );
  }

}
