import React from 'react';
import { connect } from 'react-redux';

import {
  AnnotationReportAPICreateModel,
  AnnotationReportAPIModel,
  AnnotationReportResourceType,
  DataResponse,
  Reasons,
} from 'common/api/annotation-reports';
import { AnnotationAPIModel, AnnotationResourceType } from 'common/api/annotations';
import { createResource } from 'common/store/tabs/tab/api/actions';

import Report from './Report';
import SuccessToast from './SuccessToast';
import Suggestion from './Suggestion';

interface IReportEditorProps {
  reportComponentClass: typeof Report | typeof Suggestion;
  annotation: AnnotationAPIModel;
  onCancel: (e) => void;
  onSuccess: () => void;
  createAnnotationReport: (instance: AnnotationReportAPICreateModel) => Promise<DataResponse<AnnotationReportAPIModel>>;
}

interface IReportEditorState {
  opacity: number;
  isCreating: boolean;
  isDisplayingToast: boolean;
}

@connect(
  state => state,
  dispatch => ({
    createAnnotationReport: (instance: AnnotationReportAPICreateModel) => {
        return dispatch(createResource(instance));
    },
  }),
)
export default class ReportEditor extends React.Component<Partial<IReportEditorProps>, Partial<IReportEditorState>> {

  static Report = Report;
  static Suggestion = Suggestion;

  static defaultState = {
    opacity: 1,
  };

  constructor(props: IReportEditorProps) {
    super(props);
    this.state = ReportEditor.defaultState;
  }

  getAnnotationReportInstance(reason: Reasons, comment: string) {
    return {
      type: AnnotationReportResourceType,
      attributes: { reason, comment },
      relationships: {
        annotation: {
          data: {
            id: this.props.annotation.id,
            type: AnnotationResourceType,
          },
        },
      },
    };
  }

  save = (reason: Reasons, comment: string) => {
    if (this.state.isCreating) {
      return Promise.reject(null);
    }
    this.setState({ isCreating: true });
    return this.props.createAnnotationReport(this.getAnnotationReportInstance(reason, comment)).then(
    (data) => {
        this.setState({ isCreating: false, isDisplayingToast: true });
        return data;
    }).catch((errors) => {
      this.setState({ isCreating: false });
      console.log(errors);
      // TODO: show error toast here
    });
  }

  render() {
    const {
      annotation,
      onCancel,
      reportComponentClass: ReportComponentClass,
    } = this.props;

    if (!this.state.isDisplayingToast) {
      return <ReportComponentClass annotation={annotation} onCancel={onCancel} onSubmit={this.save} />;
    } else {
      return <SuccessToast onFinish={this.props.onSuccess} />;
    }
  }
}
