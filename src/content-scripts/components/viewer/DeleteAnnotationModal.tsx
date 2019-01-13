import React from 'react';
import { connect } from 'react-redux';
import { deleteResource } from 'redux-json-api';
import Modal from 'content-scripts/components/elements/Modal/Modal';
import styles from './DeleteAnnotationModal.scss';
import Button from '../elements/Button';
import { changeNotification, hideViewerDeleteModal, setMouseOverViewer } from '../../store/widgets/actions';
import { ToastType } from '../elements/Toast/Toast';
import { selectViewerState } from '../../store/widgets/selectors';
import { selectAnnotation } from '../../store/api/selectors';
import { AnnotationAPIModel } from '../../../common/api/annotations';
import ppGA from '../../../common/pp-ga';

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
    setMouseOverViewer,
    hideViewerDeleteModal,
    changeNotification,
    deleteAnnotation: deleteResource,
  },
)
export default class DeleteAnnotationModal extends React.PureComponent<Partial<IModalProps>> {

  handleConfirmDelete = (e) => {
    this.props.deleteAnnotation(this.props.annotation)
      .then(() => {
        const attrs = this.props.annotation.attributes;
        ppGA.annotationDeleted(this.props.annotation.id, attrs.ppCategory, !attrs.comment, attrs.annotationLink);
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
    this.props.setMouseOverViewer(false);
  }

  render() {
    const {
      isDeleteModalOpen,
    } = this.props;

    if (isDeleteModalOpen) {
      return (
        <Modal onCloseModal={this.handleCancel}>
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
