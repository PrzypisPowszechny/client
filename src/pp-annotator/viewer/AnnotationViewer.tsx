import React from 'react';
import {AnnotationViewModel} from "../annotation";

interface IAnnotatorViewerProps {
  key: number;
  annotation: AnnotationViewModel;
  callbacks: ICallbacks;
}

interface IAnnotatorViewerState {
  initialView: boolean;
}

export interface ICallbacks {
  onEdit(e: React.MouseEvent<HTMLButtonElement>, annotation: AnnotationViewModel): void;
  onDelete(e: React.MouseEvent<HTMLButtonElement>, annotation: AnnotationViewModel): void;
}

export default class AnnotationViewer extends React.Component<
  IAnnotatorViewerProps,
  IAnnotatorViewerState
> {
  constructor(props: IAnnotatorViewerProps) {
    super(props);

    this.state = {
      initialView: true
      // TODO KG use also component's state to keep feedback buttons expansion state?
    };
  }

  public componentWillReceiveProps() {
    // Set timeout after which edit buttons disappear
    this.setState({ initialView: true });
    setTimeout(() => this.setState({ initialView: false }), 500);
  }

  public render() {
      const {
          priority,
          comment,
          referenceLink,
          referenceLinkTitle
        } = this.props.annotation;

    return (
            <div className="pp-annotation pp-item">
                <div className={"pp-controls " + (this.state.initialView ? "pp-visible" : "")}>
                    <button type="button"
                            title="Edit"
                            className="pp-edit"
                            onClick={(e) => this.props.callbacks.onEdit(e, this.props.annotation)}>Edit</button>
                    <button type="button"
                            title="Delete"
                            className="pp-delete"
                            onClick={(e) => this.props.callbacks.onDelete(e, this.props.annotation)}>Delete</button>
                </div>

		<div className="pp-view-head-bar">
                <div className="pp-view-comment-priority">
                    {this.props.annotation.priority}
                </div>
		<div className="pp-view-comment-date">
			01.01.1999
		</div>
		</div>

                <div className="pp-view-comment">
                    {this.props.annotation.comment}
                </div>

		<div className="pp-view-link-bar">
			<span className="pp-view-link">
			<a href={this.props.annotation.referenceLink}>
				{this.props.annotation.referenceLinkTitle}
			</a>
			</span>
		</div>
            </div>
        );
  }
}
