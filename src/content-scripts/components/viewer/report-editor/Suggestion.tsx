import React from 'react';

import classNames from 'classnames';

import { AnnotationReportAPIModel, DataResponse, Reasons } from 'common/api/annotation-reports';
import { AnnotationAPIModel } from 'common/api/annotations';
import ppGa from 'common/pp-ga';
import { PPScopeClass } from 'content-scripts/settings';

import styles from './ReportEditor.scss';

interface ISuggestionProps {
  annotation: AnnotationAPIModel;
  onCancel: (e) => void;
  onSubmit: (reason: Reasons, comment: string) => Promise<DataResponse<AnnotationReportAPIModel>|void>;
}

interface ISuggestionState {
  comment: string;
  showCommentError: boolean;
}

export default class Suggestion extends React.Component<Partial<ISuggestionProps>, Partial<ISuggestionState>> {
  constructor(props: ISuggestionProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    ppGa.annotationSuggestionFormOpened(this.props.annotation.id);
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const stateUpdate = {
      [target.name]: target.value,
      showCommentError: target.name !== 'reason' && this.state.showCommentError,
    };
    this.setState(stateUpdate);
  }

  submit = () => {
    if (!this.state.comment) {
      this.setState({ showCommentError: true });
    } else {
      this.props.onSubmit(Reasons.SUGGESTED_CORRECTION, this.state.comment).then( () => {
        ppGa.annotationSuggestionSent(this.props.annotation.id, !this.state.comment);
      }).catch(() => null);
    }
  }

  render() {
    return (
      <div className={classNames(PPScopeClass, styles.self, styles.selfEdge, styles.editor)}>
        <h3>Co można poprawić w tym przypisie?</h3>
        <div className={classNames(styles.input)}>
          <div>
            <textarea
              name="comment"
              placeholder="Wpisz tutaj swoje uwagi"
              onChange={this.handleInputChange}
            />
          </div>
          <div
            className={classNames(styles['error-msg'], 'ui', 'pointing', 'red', 'basic', 'label', 'large',
              { [styles.hidden]: !this.state.showCommentError })}
          >
            Wpisz swoje uwagi!
          </div>
        </div>
        <div className={styles.submitButtons}>
          <button onClick={this.props.onCancel} className={styles.cancel}>Anuluj</button>
          <button onClick={this.submit} className={styles.submit}>Wyślij</button>
        </div>
      </div>
    );
  }
}
