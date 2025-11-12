'use client'

import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Button } from '@t1-org/t1components';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function ErrorDialog({ open, onClose, title, message }: ErrorDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          padding: '20px'
        }
      }}
    >
      <DialogTitle sx={{ padding: 0, marginBottom: '16px' }}>
        <div className="flex items-center gap-[12px]">
          <div className="w-[40px] h-[40px] rounded-full bg-[#fef0ef] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5V10M10 13.3333H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="#db362b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-semibold text-[18px] leading-[24px] text-[#4c4c4c] m-0">
            {title}
          </h2>
        </div>
      </DialogTitle>

      <DialogContent sx={{ padding: 0, marginBottom: '24px' }}>
        <p className="font-normal text-[14px] leading-[20px] text-[#828282] m-0">
          {message}
        </p>
      </DialogContent>

      <div className="flex justify-end">
        <Button
          onClick={onClose}
          className="!w-[120px] !h-[36px]"
        >
          Cerrar
        </Button>
      </div>
    </Dialog>
  );
}
