import React from "react"
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Button, Grid2, IconButton } from "@mui/material";
import useStyles from '../../../../css/home/sidenav'; import Show from "../../../../share/utils/Show";

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default () => {
    const classes = useStyles();
    const [state, setState] = React.useState({ left: true });
    const [hydrated, setHydrated] = React.useState(false);

    const handlerCloseNav = () => {
        setHydrated(!hydrated)
    }

    window.addEventListener('resize', () => {
        const width_ = window.innerWidth
        if (width_ <= 700) handlerCloseNav()
    })

    const toggleDrawer =
        (anchor: Anchor, open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setState({ ...state, [anchor]: open });
            };

    const list = (anchor: Anchor) => (
        <Box
            sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {['RRC', 'RAAC'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    return (
        <React.Fragment>
            <Grid2 className={classes.showMobile}>
                <IconButton onClick={handlerCloseNav} sx={{ width: '50px'}}>
                    <img src="/assets/img/hamburger.svg" />
                </IconButton>
                <Show when={hydrated}>
                    <Button  onClick={handlerCloseNav} className={classes.closeNav} />
                </Show>
            </Grid2>
            <Show when={hydrated}>
                <Grid2 className={classes.containerNav}>
                    {list('left')}
                </Grid2>
            </Show>
        </React.Fragment>
    )
}