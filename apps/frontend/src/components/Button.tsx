import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} className={['el-button', `el-button--${variant}`, className].filter(Boolean).join(' ')} {...props} />;
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: IconName;
  // Required: an icon-only control must have an accessible name.
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, type = 'button', className, ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} className={['el-icon-button', className].filter(Boolean).join(' ')} {...props}>
      <Icon name={icon} />
    </button>
  );
});
