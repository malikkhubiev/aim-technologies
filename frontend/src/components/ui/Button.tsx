import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'danger' }

export function Button({ variant = 'default', className = '', ...rest }: Props) {
    const variantClass = variant === 'danger' ? 'btn btn-danger' : 'btn'
    return <button className={`${variantClass} ${className}`} {...rest} />
}


