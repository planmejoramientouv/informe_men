"use client"

import React from "react"
import { Button } from "@mui/material"
import { Group as GroupIcon } from "@mui/icons-material"

const EditorsManager = React.lazy(() => import("./EditorsManager"))

function useUserRole() {
  const [role, setRole] = React.useState("")
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { getCookieData } = await import("../../../../libs/utils/utils")
        //  cookie "data" ya trae { rol: 'editor' | 'director' | ... }
        const c = getCookieData("data") || {}
        if (!alive) return
        setRole(String(c.rol || "").trim().toLowerCase())
      } catch {
        if (!alive) return
        setRole("")
      }
    })()
    return () => { alive = false }
  }, [])
  return role
}

export default function EditorsManagerLauncher({
  defaultNivel = "",
  contextOverride = null,
  buttonVariant = "outlined",
  buttonSize = "small",
  sx = {},
}) {
  const role = useUserRole()
  const [open, setOpen] = React.useState(false)

  // Ocultar a rol 'editor'
  if (role === "editor") return null

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        startIcon={<GroupIcon />}
        onClick={() => setOpen(true)}
        sx={sx}
      >
        Gestionar editores
      </Button>

      <React.Suspense fallback={null}>
        {open && (
          <EditorsManager
            open={open}
            onClose={() => setOpen(false)}
            defaultNivel={defaultNivel}
            contextOverride={contextOverride}
          />
        )}
      </React.Suspense>
    </>
  )
}
