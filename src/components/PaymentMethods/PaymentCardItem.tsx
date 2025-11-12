'use client';

import { useState, useMemo, useActionState, useEffect } from 'react';
import { PaymentMethod } from '@interfaces/paymentMethods';
import { checkCardExpiry } from '@utils/paymentValidation';
import { formatExpirationDisplay, maskCardNumber } from '@utils/paymentFormatters';
import { ActionMenu, ActionMenuItem, Button, Chip } from '@t1-org/t1components';
import Image from 'next/image';
import VisaIcon from 'assets/checkout/visa-icon.svg';
import MasterIcon from 'assets/checkout/master-icon.svg';
import AmexIcon from 'assets/checkout/amex-icon.svg';
import CarnetIcon from 'assets/checkout/carnet-icon.svg';
import {
  setDefaultPaymentMethodAction,
  setBackupPaymentMethodAction,
  deletePaymentMethodAction
} from '@services/paymentMethodsService';

interface PaymentCardItemProps {
  data: PaymentMethod;
  sellerId: number;
  userEmail: string;
  onCardUpdated?: () => void;
  renderAddButton?: boolean;
  onAddClick?: () => void;
}

// Mapping of card brands to icons
const cardBrandIcons: Record<string, any> = {
  'visa': VisaIcon,
  'mastercard': MasterIcon,
  'master-card': MasterIcon,
  'american-express': AmexIcon,
  'amex': AmexIcon,
  'carnet': CarnetIcon
};

export default function PaymentCardItem({
  data,
  sellerId,
  userEmail,
  onCardUpdated,
  renderAddButton,
  onAddClick
}: PaymentCardItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Action states
  const [, setDefaultAction, setDefaultPending] = useActionState(setDefaultPaymentMethodAction, undefined);
  const [, setBackupAction, setBackupPending] = useActionState(setBackupPaymentMethodAction, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePaymentMethodAction, undefined);

  // Check if card is expired
  const expiryCheck = useMemo(() =>
    checkCardExpiry(data.expiration_month, data.expiration_year),
    [data.expiration_month, data.expiration_year]
  );

  // Get card brand icon
  const cardIcon = cardBrandIcons[data.brand.toLowerCase()] || VisaIcon;

  // Handle successful deletion
  useEffect(() => {
    if (deleteState?.success) {
      setShowDeleteModal(false);
      onCardUpdated?.();
    }
  }, [deleteState, onCardUpdated]);

  // Menu options based on card status
  const menuOptions = useMemo<ActionMenuItem[]>(() => {
    const options: ActionMenuItem[] = [];

    // If not default and not expired, show "Set as primary"
    if (!data.default && !expiryCheck.expired) {
      options.push({
        id: 'default',
        label: 'Establecer como principal',
        onClick: () => {
          setIsProcessing(true);
          setDefaultAction({ cardId: data.id, sellerId, email: userEmail });
          setTimeout(() => {
            setIsProcessing(false);
            onCardUpdated?.();
          }, 1000);
        }
      });
    }

    // If not backup and not expired and not default, show "Set as backup"
    if (!data.backup && !expiryCheck.expired && !data.default) {
      options.push({
        id: 'backup',
        label: 'Establecer como respaldo',
        onClick: () => {
          setIsProcessing(true);
          setBackupAction({ cardId: data.id, sellerId, email: userEmail, backup: true });
          setTimeout(() => {
            setIsProcessing(false);
            onCardUpdated?.();
          }, 1000);
        }
      });
    }

    // Always show delete option (except for default card)
    if (!data.default) {
      options.push({
        id: 'delete',
        label: 'Eliminar',
        color: 'error' as const,
        onClick: () => setShowDeleteModal(true)
      });
    }

    return options;
  }, [data.default, data.backup, data.id, expiryCheck.expired, sellerId, userEmail, onCardUpdated]);

  return (
    <div className="flex flex-col gap-5 w-full lg:w-auto">
      {/* Card Display */}
      <div className="p-4 border rounded-[10px] lg:w-[362px] w-full h-[122px] flex justify-between">
        <div className="flex items-center gap-5">
          <Image
            src={cardIcon}
            alt={data.brand}
            width={70}
            height={45}
          />
          <div className="flex flex-col gap-[7px]">
            <span className="text-[17px] font-bold">{maskCardNumber(undefined, data.termination)}</span>
            {expiryCheck.expired ? (
              <span className="text-xs font-medium text-[#DB362B]">
                Expirada {formatExpirationDisplay(data.expiration_month, data.expiration_year)}
              </span>
            ) : (
              <span className="text-xs font-medium">
                Vigencia {formatExpirationDisplay(data.expiration_month, data.expiration_year)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between flex-col items-end">
          <ActionMenu
            loading={isProcessing || setDefaultPending || setBackupPending}
            items={menuOptions}
          />

          {/* Badges */}
          {data.backup && (
            <Chip
              label="Respaldo"
              color="white"
              variant="filled"
              size="small"
              className="!h-[max-content]"
            />
          )}

          {data.default && (
            <Chip
              label="Principal"
              color="warning"
              variant="filled"
              size="small"
              className="!h-[max-content]"
            />
          )}
        </div>
      </div>

      {/* Add Card Button */}
      {renderAddButton && onAddClick && (
        <Button
          variant="outlined"
          className="w-full !h-[35px]"
          onClick={onAddClick}
        >
          Añadir tarjeta
        </Button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#4C4C4C] mb-4">
              Eliminar método de pago
            </h3>
            <p className="text-sm text-[#4C4C4C] mb-6">
              Al eliminar esta tarjeta, ya no podrás usarla para futuros pagos. ¿Estás seguro de que deseas eliminar esta tarjeta de tus métodos de pago?
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outlined"
                className="!h-[35px]"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletePending}
              >
                Cancelar
              </Button>
              <Button
                className="!h-[35px]"
                loading={deletePending}
                disabled={deletePending}
                onClick={() => deleteAction(data.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
