import { useEffect, useId, useRef } from 'react'
import shared from '../../styles/shared.module.scss'
import styles from './ConfirmDialog.module.scss'

export default function ConfirmDialog({ request, onClose }) {
  const dialog = useRef(null)
  const cancel = useRef(null)
  const id = useId()
  useEffect(() => {
    const previous = document.activeElement
    const element = dialog.current
    element.showModal()
    cancel.current.focus()
    return () => {
      element.close()
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} onCancel={event => { event.preventDefault(); onClose() }}>
    <h2 id={`${id}-title`}>{request.title}</h2>
    <p id={`${id}-message`}>{request.message}</p>
    <div className={styles.actions}>
      <button ref={cancel} type="button" className={shared.button} onClick={onClose}>Cancel</button>
      <button type="button" className={shared.primary} onClick={() => { onClose(); request.action() }}>{request.confirmLabel}</button>
    </div>
  </dialog>
}
