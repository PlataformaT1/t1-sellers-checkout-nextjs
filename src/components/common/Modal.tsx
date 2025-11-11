'use client'

import React from 'react';
import styles from '@styles/components/Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeButtonText?: string;
  onConfirm?: () => void;
  confirmButtonText?: string;
  variant?: 'error' | 'success' | 'warning' | 'info';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeButtonText = 'Aceptar',
  onConfirm,
  confirmButtonText = 'Confirmar',
  variant = 'error'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.modalContent} ${styles[variant]}`}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>{title}</h5>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {children}
        </div>
        
        <div className={styles.modalFooter}>
          {onConfirm && (
            <button
              type="button"
              className={`${styles.confirmBtn} ${styles[`${variant}Confirm`]}`}
              onClick={onConfirm}
            >
              {confirmButtonText}
            </button>
          )}
          
          {showCloseButton && (
            <button
              type="button"
              className={`${styles.closeBtn} ${styles[`${variant}Close`]}`}
              onClick={onClose}
            >
              {closeButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
