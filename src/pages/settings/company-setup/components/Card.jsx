import React from 'react'

export default function Card({ children }) {
  return (
    <div className="company-card nova-card p-4">
      {children}
    </div>
  )
}