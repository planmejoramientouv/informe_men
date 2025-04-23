// src/components/Popup.jsx

import React from 'react'
import { makeStyles } from '@mui/styles'
import { Dialog, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const useStyles = makeStyles({
  dialogPaper: {
    width: '80%',
    height: '800px',
    maxWidth: 'none !important',
    borderRadius: '8px',
    position: 'relative',
  },
  content: {
    marginTop: '30px',
    height: '100%',
    overflowY: 'auto',
    padding: '16px',
  },
  closeButton: {
    display: 'flex !important',
    justifyContent: 'end',
    position: 'absolute !important',
    top: '8px',
    right: '8px',
    marginBottom: '20px',
    zIndex: 10,
  },
})

/**
 * Popup
 * @param {boolean} open
 * @param {void} onClose
 * @param {React.ReactNode} children
 */
export default function Popup ({ open, onClose, children }) {
  const classes = useStyles()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
      aria-labelledby="popup-dialog"
    >
      <IconButton
        aria-label="Cerrar"
        className={classes.closeButton}
        onClick={onClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent className={classes.content}>
        {children}
      </DialogContent>
    </Dialog>
  )
}