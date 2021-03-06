import React from 'react';
import { connect } from 'react-redux';

import { AnnotationAPIModel } from 'common/api/annotations';
import ppGa from 'common/pp-ga';
import { deleteResource } from 'common/store/tabs/tab/api/actions';
import { selectAnnotation } from 'common/store/tabs/tab/api/selectors';
import { changeNotification, hideViewerDeleteModal } from 'common/store/tabs/tab/widgets/actions';
import { selectViewerState } from 'common/store/tabs/tab/widgets/selectors';
import Modal from 'content-scripts/components/elements/Modal/Modal';

import styles from './DeleteAnnotationModal.scss';

import { PPViewerIndirectHoverClass } from '../../settings';
import Button from '../elements/Button';
import { ToastType } from '../elements/Toast/Toast';

interface IModalProps {
  deleteModalId: string;
  isDeleteModalOpen: boolean;

  annotation: AnnotationAPIModel;

  deleteAnnotation: (instance: AnnotationAPIModel) => Promise<object>;
  setMouseOverViewer: (value: boolean) => void;
  hideViewerDeleteModal: () => void;
  changeNotification: (visible: boolean, message?: string, type?: ToastType) => void;
}

@connect(
  (state) => {
    const {
      deleteModal: {
        deleteModalId,
        isDeleteModalOpen,
      },
    } = selectViewerState(state);

    return {
      deleteModalId,
      isDeleteModalOpen,
      annotation: selectAnnotation(state, deleteModalId),
    };
  },
  {
    hideViewerDeleteModal,
    changeNotification,
    deleteAnnotation: deleteResource,
  },
)
export default class DeleteAnnotationModal extends React.PureComponent<Partial<IModalProps>> {

  handleConfirmDelete = (e) => {
    // Save annotation for when it is already deleted
    const annotation = this.props.annotation;
    this.props.deleteAnnotation(this.props.annotation)
      .then(() => {
        const attrs = annotation.attributes;
        ppGa.annotationDeleted(annotation.id, attrs.ppCategory, !attrs.comment, attrs.annotationLink);
        this.props.changeNotification(true, 'Usunięto przypis', ToastType.success);
      })
      .catch((errors) => {
        console.log(errors);
        this.props.changeNotification(true, 'Błąd! Nie udało się usunąć przypisu', ToastType.failure);
        this.props.hideViewerDeleteModal();
      });
  }

  handleCancel = (e) => {
    this.props.hideViewerDeleteModal();
  }

  render() {
    const {
      isDeleteModalOpen,
    } = this.props;

    if (isDeleteModalOpen) {
      return (
        <Modal
          className={PPViewerIndirectHoverClass}
          onCloseModal={this.handleCancel}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              Czy na pewno chcesz usunąć przypis?
            </div>
            <div className={styles.controls}>
              <Button onClick={this.handleCancel}>
                Nie
              </Button>
              <Button appearance="primary" onClick={this.handleConfirmDelete}>
                Tak
              </Button>
            </div>
          </div>
        </Modal>
      );
    } else {
      return null;
    }
  }
}
