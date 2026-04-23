import React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function norm(v) {
  return String(v || '').trim().toLowerCase();
}

export default function DeleteProcessCard({
  role = '',
  title = 'Eliminar proceso',
  hint = 'Elimina PERMISOS y archivos en Drive',
  borderColor = '#b71c1c',
  onDeleted,
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [working, setWorking] = React.useState(false);
  const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

  const loadOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sheets');
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];

      const active = rows.filter((r) => {
        const estado = norm(r?.estado) === 'activo';
        const proceso = ['rrc', 'raac'].includes(norm(r?.proceso));
        const hasId = String(r?.id || '').trim() !== '';
        return estado && proceso && hasId;
      });

      setOptions(active);
    } catch (e) {
      console.error(e);
      setOptions([]);
      setSnack({ open: true, severity: 'error', message: 'No se pudo cargar la lista de procesos.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await loadOptions();
  };

  const handleDelete = async () => {
    if (!selected?.id) return;

    try {
      setWorking(true);

      const res = await fetch('/api/deleteProcess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          requesterRole: role,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.error || 'No se pudo eliminar el proceso');
      }

      setSnack({
        open: true,
        severity: 'success',
        message: `Proceso eliminado: ${selected?.programa || ''} (${selected?.proceso || ''} ${selected?.year || ''}).`,
      });

      setOpen(false);
      setSelected(null);
      if (typeof onDeleted === 'function') onDeleted(json?.data);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: 'error', message: e?.message || 'Error eliminando proceso.' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
        fullWidth
        startIcon={<DeleteOutlineIcon />}
        sx={{
          mt: 1,
          justifyContent: 'flex-start',
          textTransform: 'none',
          borderRadius: 2,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: 'divider',
          py: 2.5,
          px: 2.5,
          gap: 1.5,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: borderColor,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
          '&:hover': {
            borderColor: borderColor,
            backgroundColor: 'action.hover',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: borderColor,
            outlineOffset: 2,
          },
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h6">{title}</Typography>
          {hint && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Eliminar proceso</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción elimina la fila en PERMISOS y envía a papelera el Google Sheet y su carpeta en Drive.
          </Alert>

          <Autocomplete
            options={options}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            loading={loading}
            getOptionLabel={(opt) => {
              const p = opt?.programa || '';
              const pr = opt?.proceso || '';
              const y = opt?.year || '';
              const n = opt?.nivel || '';
              return `${p} - ${pr} ${y} (${n})`;
            }}
            isOptionEqualToValue={(a, b) => String(a?.id) === String(b?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Proceso a eliminar"
                placeholder="Selecciona un proceso"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={working}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={working || !selected}
            startIcon={working ? <CircularProgress size={16} /> : null}
          >
            {working ? 'Eliminando...' : 'Eliminar proceso'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
