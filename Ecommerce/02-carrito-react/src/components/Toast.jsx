import { useEffect } from 'react'

function Toast({ message, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2300)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="toast-container">
      <div className="toast">{message}</div>
    </div>
  )
}

export default Toast
