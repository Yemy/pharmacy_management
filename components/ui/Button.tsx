import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'px-4 py-2 rounded-md font-medium'
  const variants: Record<string,string> = {
    primary: 'bg-primary text-primary-foreground',
    ghost: 'bg-transparent border'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
