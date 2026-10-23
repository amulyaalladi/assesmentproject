import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal
        open={open}
        onRequestClose={() => {
          onClose()
          setOpen(false)
        }}
      >
        <Modal.Header>
          <Modal.Title>Edit task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input aria-label="First" />
          <input aria-label="Second" />
        </Modal.Body>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('exposes an accessible dialog and focuses the first field', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.getByRole('dialog', { name: 'Edit task' })).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByLabelText('First')).toHaveFocus()
  })

  it('traps Tab focus inside the dialog', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    await user.tab()
    expect(screen.getByLabelText('Second')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('First')).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByLabelText('Second')).toHaveFocus()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
