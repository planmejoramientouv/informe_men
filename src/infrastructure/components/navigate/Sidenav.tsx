import React from "react"
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Button, Grid2, IconButton } from "@mui/material";
import useStyles from '../../../../css/home/sidenav'; 
import Show from "../../../../share/utils/Show";
import { useRouter } from 'next/router';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default () => {
    const classes = useStyles();
    const [state, setState] = React.useState({ left: !(window.innerWidth <= 700) });
    const [hydrated, setHydrated] = React.useState(false);
    const [hash, setHash] = React.useState("");
    const router = useRouter();

    const handlerCloseNav = () => {
        setHydrated(!hydrated)
    }

    window.addEventListener('resize', () => {
        const width_ = window.innerWidth
        setHydrated(!(width_ <= 700))
    })

    const handlerSelected = (text: string): boolean => {
        let selected: boolean = false
        if (`#${text}` === hash.toUpperCase()) selected = true

        return selected
    }

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
                {[{text: 'INICIO' , route: '/'},{text: 'RRC' , route: '/rrc'}, {text: 'RAAC' , route: '/rrc'}].map((item, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => router.push(item.route)} selected={handlerSelected(item.text)}>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    React.useEffect(() => {
        setHydrated(true);
        setHash(window.location.hash);
    }, []);

    return (
        <React.Fragment>
            <Grid2 className={classes.showMobile}>
                <IconButton onClick={handlerCloseNav} sx={{ width: '50px'}}>
                    <img src="/assets/img/hamburger.svg" />
                </IconButton>
                <Show when={hydrated}>
                    <a onClick={handlerCloseNav} className={classes.closeNav} />
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