
// Interfaces base reutilizáveis
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Props comuns para componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BaseModalProps extends BaseComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

// Props específicas de Cliente
export interface ClienteIdentification {
  clienteId: string;
  nomeCliente: string;
  emailCliente?: string;
}

export interface ClienteBasicInfo extends ClienteIdentification {
  telefone?: string;
  emailGestor?: string;
}

// Props para componentes de linha da tabela
export interface TableRowProps extends BaseComponentProps {
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface EditableFieldProps {
  value: string;
  onSave: (value: string) => Promise<boolean>;
  onCancel: () => void;
  placeholder?: string;
  disabled?: boolean;
}

// Props para componentes de status
export interface StatusComponentProps {
  value: string;
  onValueChange: (newValue: string) => void;
  disabled?: boolean;
  isUpdating?: boolean;
  compact?: boolean;
}

// Props para modais específicos
export interface ClienteModalProps extends BaseModalProps, ClienteIdentification {
  trigger?: React.ReactElement;
}

export interface ComissaoModalProps extends ClienteModalProps {
  valorAtual?: number;
  isGestorDashboard?: boolean;
  isAdmin?: boolean;
  onUpdate?: () => void;
}

// Props para formulários
export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export interface SelectFieldProps extends Omit<FormFieldProps, 'onChange'> {
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

// Props para componentes de upload
export interface FileUploadProps extends BaseComponentProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}

// Estados de loading e erro
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncOperationState extends LoadingState {
  data?: any;
  lastUpdated?: Date;
}

// Props para componentes com paginação
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Props para filtros
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

// Tipos de permissão
export type UserRole = 'admin' | 'gestor' | 'cliente' | 'vendedor';

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canManageUsers?: boolean;
}

// Props para componentes com permissões
export interface PermissionAwareProps {
  userRole: UserRole;
  userEmail: string;
  permissions?: UserPermissions;
}
