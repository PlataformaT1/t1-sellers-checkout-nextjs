import { Dispatch, SetStateAction } from "react";

// Interfaces
export interface SubPath {
  href: string;
  text: string;
  hasNotification?: boolean;
  endAdornmentSubPath?: React.ReactNode | string;
}

export interface MenuPath {
  href?: string;
  text?: string;
  icon?: any;
  activeIcon?: any;
  subPaths?: SubPath[];
  concatStoreId?: boolean;
  endAdornment?: React.ReactNode;
  type?: string | any | 'INFORMATIVE_TEXT';
  component?: React.ComponentType<any>;
  hasNotification?: boolean;
  autoNavigateToFirstSubPath?: boolean;
  dataTourTarget?: string;
}

export interface SidebarPropsI {
  shippingBannerTitle?: string;
  className?: string;
  menuPaths?: MenuPath[];
  TopBanner?: React.ComponentType<{ className?: string }>;
  BottomBanner?: React.ComponentType<{ className?: string }> | React.ReactNode;
  BalanceBannerComponent? : React.ComponentType<{ className?: string }> ;
  showCreateButton?: boolean;
  showInfoBand?: boolean;
  showBalance?: boolean;
  balanceBannerConfig?: {
    balance: balanceI,
    BALLANCE_PATH: string
  }
  createButtonText?: string;
  createButtonPath?: string;
  breakpointReduce?: number;
  breakpointMobile?: number;
  currentUserId?: string | number;
  restrictedPaths?: string[];
  stores?: any[];
  currentStore?: any;
  onStoreChange?: (storeId: number) => void;
  createStoreUrl?: string;
  
  defaultAutoNavigateToFirstSubPath?: boolean;
  
  // Props opcionales para override externo (solo si se necesita)
  isOpen?: boolean;
  isReduced?: boolean;
  isMobile?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  onToggleReduce?: (isReduced: boolean) => void;
  onCreateClick?: () => void;
  onNavigate?: (path: string) => void;
}

export interface BalanceBannerI {
    className?: string,
    balance: balanceI,
    BALLANCE_PATH: string
}

export interface balanceI {
    monto_actual: number
    comercio_id: number
    comercio_id_t1paginas: string
    credito: boolean
}
