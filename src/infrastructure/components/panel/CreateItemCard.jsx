// components/panel/CreateItemCard.jsx
import React from 'react';
import useStyles from '../../../../css/form/form.css.js';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

const SEDES_BY_TIPO = {
  rrc: ['Regionales', 'Cali'],
  raac: ['Ampliación', 'Cali'],
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateItemCard({
  title = 'Crear nuevo proceso',
  hint = 'Configura y guarda un proceso',
  borderColor = '#1976D2',
  sedesByTipo = SEDES_BY_TIPO,
  onSave,
}) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState('');
  const [sede, setSede] = React.useState('');
  const [programa, setPrograma] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [programasOpts, setProgramasOpts] = React.useState([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [openAuto, setOpenAuto] = React.useState(false);
  const [periodo, setPeriodo] = React.useState('');


    React.useEffect(() => {
    setSede('');
    setPrograma('');
    setProgramasOpts([]);
  }, [tipo]);

  const sedes = tipo ? (sedesByTipo?.[tipo] ?? []) : [];
  const errors = {
    tipo: !tipo && touched,
    sede: !sede && touched,
    programa: !programa && touched,
    email: (!email || !emailRegex.test(email)) && touched,
  };
  const canSave = Boolean(tipo && sede && programa && emailRegex.test(email));

  const reset = () => {
    setTipo('');
    setSede('');
    setPrograma('');
    setPeriodo('');
    setEmail('');
    setTouched(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); reset(); };
  const handleSave = async () => {
    setTouched(true);
    if (!canSave) return;
    const payload = { tipo, sede, programa, periodo, email };
    try {
      if (typeof onSave === 'function') await onSave(payload);
      handleClose();
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
  let alive = true; // evita setState después de ununmount/rápidos cambios

  const fetchPrograms = async () => {
    if (!tipo || !sede) {
      setProgramasOpts([]);
      setPeriodo('');
      return;
    }
    try {
      setLoadingPrograms(true);              
      const res = await fetch(`/api/programs?tipo=${encodeURIComponent(tipo.toUpperCase())}&sede=${encodeURIComponent(sede)}`);
      const json = await res.json();
      if (!alive) return;
      setProgramasOpts(json?.status ? (json.data || []) : []);
      setPeriodo(''); 
        setPrograma('');
    } catch (e) {
      console.error(e);
      if (!alive) return;
      setProgramasOpts([]);
        setPeriodo('');
        setPrograma('');
    } finally {
      if (!alive) return;
      setLoadingPrograms(false);            
    }
  };

  fetchPrograms();
  return () => { alive = false; };
}, [tipo, sede]);


  const sedesList = tipo ? SEDES_BY_TIPO[tipo.toLowerCase()] || [] : [];

  return (
    <>
      {/* Tarjeta clickable */}
      <Paper
        className={classes.forItemsPanel}
        onClick={handleOpen}
        elevation={1}
        sx={{
          borderTop: `6px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          p: 2,
        }}
      >
        <AddCircleOutlineIcon sx={{ fontSize: 34 }} />
        <Box>
          <Typography variant="h2">{title}</Typography>
          {hint && <Typography variant="body2" sx={{ opacity: 0.8 }}>{hint}</Typography>}
        </Box>
      </Paper>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Crear proceso</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* TIPO */}
          <FormControl fullWidth margin="normal" error={errors.tipo}>
            <InputLabel id="tipo-label">Tipo</InputLabel>
            <Select
              labelId="tipo-label"
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)} // 'rrc' | 'raac'
              onBlur={() => setTouched(true)}
              size="small"
            >
              <MenuItem value="rrc">RRC</MenuItem>
              <MenuItem value="raac">RAAC</MenuItem>
            </Select>
            {errors.tipo && <FormHelperText>Selecciona un tipo.</FormHelperText>}
          </FormControl>

          {/* SEDE (dependiente del tipo) */}
          <FormControl fullWidth margin="normal" error={errors.sede} disabled={!tipo}>
            <InputLabel id="sede-label">Sede</InputLabel>
            <Select
              labelId="sede-label"
              label="Sede"
              value={sede}
              onChange={(e) => setSede(e.target.value)} // 'Regionales'/'Cali' o 'Ampliación'/'Cali'
              onBlur={() => setTouched(true)}
            >
              {sedesList.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
            {errors.sede && <FormHelperText>Selecciona una sede.</FormHelperText>}
          </FormControl>

        {/* PROGRAMA (buscable con Autocomplete) */}
        <Autocomplete
        disabled={!sede}
        options={programasOpts}
        value={programa ? { program: programa, periodo } : null}
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.program) || ''}
        onChange={(_, opt) => {
        if (!opt) { setPrograma(''); setPeriodo(''); return; }
        setPrograma(opt.program);
        setPeriodo(opt.period); // <- guardamos el periodo seleccionado
        }}
        loading={loadingPrograms}
        autoHighlight
        blurOnSelect
        disablePortal
        open={openAuto}                          // <-- controlar apertura
        onOpen={() => setOpenAuto(true)}         // <--
        onClose={() => setOpenAuto(false)}       // <--
        ListboxProps={{ style: { maxHeight: 240, overflowY: 'auto' } }}
        sx={{ mt: 2 }}
        renderInput={(params) => (
            <TextField
            {...params}
            label="Programa"
            size="small"
            margin="normal"
            error={errors.programa}
            helperText={errors.programa ? 'Selecciona un programa.' : ''}
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                <>
                    {openAuto && loadingPrograms ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                </>
                ),
            }}
            />
        )}
        />


          {/* EMAIL */}
          <TextField
            fullWidth
            margin="normal"
            label="Correo para permisos"
            placeholder="usuario@correounivalle.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            onBlur={() => setTouched(true)}
            error={errors.email}
            helperText={errors.email ? 'Correo inválido.' : ''}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave /* canSave ya incluye programa/tipo/sede/email */}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}