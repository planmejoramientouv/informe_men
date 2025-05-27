/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import For from '../../../../share/utils/For'
import printAccordion from './Accordion'

// Tabs
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';

// Material - IU

import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Collapse,
  alpha,
  ThemeProvider,
  createTheme,
} from "@mui/material"
import {
  Search,
  Settings,
  AccountCircle,
  Dashboard as DashboardIcon,
  Computer,
  Storage,
  Language,
  Security,
  BarChart,
  Code,
  ExpandLess,
  ExpandMore,
  Cloud,
} from "@mui/icons-material"

// Hooks
import { setCookieRRC, firstLevelPermission } from '../../../../libs/utils/utils'

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

const drawerWidth = 280

const styles = {
  appBar: {
    zIndex: (theme: any) => theme.zIndex.drawer + 1,
    backgroundColor: "#fff",
    color: "#202124",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mr: 4,
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 500,
    color: "#1976d2",
  },
  search: {
    position: "relative",
    borderRadius: "24px",
    backgroundColor: alpha("#000", 0.05),
    "&:hover": {
      backgroundColor: alpha("#000", 0.08),
    },
    marginLeft: 0,
    width: "100%",
    maxWidth: 600,
    flex: 1,
  },
  searchIcon: {
    padding: (theme: any) => theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#757575",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: (theme: any) => theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${(theme: any) => theme.spacing(4)})`,
    transition: (theme: any) => theme.transitions.create("width"),
    width: "100%",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      borderRight: "1px solid #e0e0e0",
    },
  },
  drawerContainer: {
    overflow: "auto",
    mt: 1,
  },
  listItem: {
    display: "block",
    px: 0,
  },
  listItemButton: {
    minHeight: 48,
    px: 3,
    borderLeft: "4px solid transparent",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  listItemButtonActive: {
    backgroundColor: "#e3f2fd",
    borderLeft: "4px solid #1976d2",
    "&:hover": {
      backgroundColor: "#e3f2fd",
    },
  },
  listItemIcon: {
    minWidth: 40,
    color: "#757575",
  },
  listItemText: {
    "& .MuiListItemText-primary": {
      fontSize: "14px",
      fontWeight: 500,
      color: "#424242",
    },
  },
  submenu: {
    backgroundColor: "#fafafa",
    borderLeft: "2px solid #e0e0e0",
    ml: 3,
  },
  submenuItem: {
    pl: 6,
    minHeight: 40,
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  submenuText: {
    "& .MuiListItemText-primary": {
      fontSize: "13px",
      color: "#616161",
    },
  },
  content: {
    flexGrow: 1,
    p: 4,
    backgroundColor: "#fafafa",
    minHeight: "100vh",
  },
  contentHeader: {
    mb: 4,
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: 400,
    color: "#202124",
    mb: 1,
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#5f6368",
  },
  welcomeCard: {
    mb: 4,
    p: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
  welcomeTitle: {
    fontSize: "24px",
    fontWeight: 400,
    color: "#202124",
    mb: 2,
  },
  welcomeText: {
    fontSize: "16px",
    color: "#5f6368",
    lineHeight: 1.6,
  },
  serviceCard: {
    height: "100%",
    cursor: "pointer",
    transition: "box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
    },
  },
  cardIcon: {
    mb: 2,
    color: "#1976d2",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 500,
    color: "#202124",
    mb: 1,
  },
  cardDescription: {
    fontSize: "14px",
    color: "#5f6368",
    lineHeight: 1.5,
  },
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  submenu?: { id: string; label: string }[]
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Panel Principal",
    icon: <DashboardIcon />,
  },
  {
    id: "compute",
    label: "Compute Engine",
    icon: <Computer />,
    submenu: [
      { id: "instances", label: "Instancias de VM" },
      { id: "disks", label: "Discos" },
      { id: "snapshots", label: "Instantáneas" },
    ],
  },
  {
    id: "storage",
    label: "Cloud Storage",
    icon: <Storage />,
    submenu: [
      { id: "buckets", label: "Buckets" },
      { id: "transfer", label: "Transferencia" },
    ],
  },
  {
    id: "networking",
    label: "Redes",
    icon: <Language />,
    submenu: [
      { id: "vpc", label: "Redes VPC" },
      { id: "firewall", label: "Firewall" },
      { id: "load-balancer", label: "Balanceadores" },
    ],
  },
  {
    id: "security",
    label: "Seguridad",
    icon: <Security />,
    submenu: [
      { id: "iam", label: "IAM y administración" },
      { id: "secrets", label: "Secret Manager" },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoreo",
    icon: <BarChart />,
  },
  {
    id: "apis",
    label: "APIs y servicios",
    icon: <Code />,
  },
]

const contentData = {
  dashboard: {
    title: "Panel Principal",
    subtitle: "Resumen de tu proyecto en la nube",
    cards: [
      {
        icon: <Computer sx={{ fontSize: 32 }} />,
        title: "Compute Engine",
        description: "Máquinas virtuales escalables y de alto rendimiento",
      },
      {
        icon: <Storage sx={{ fontSize: 32 }} />,
        title: "Cloud Storage",
        description: "Almacenamiento de objetos unificado para desarrolladores",
      },
      {
        icon: <Security sx={{ fontSize: 32 }} />,
        title: "Seguridad",
        description: "Protege tus recursos con herramientas de seguridad avanzadas",
      },
      {
        icon: <BarChart sx={{ fontSize: 32 }} />,
        title: "Monitoreo",
        description: "Observabilidad completa para tus aplicaciones",
      },
    ],
  },
  compute: {
    title: "Compute Engine",
    subtitle: "Gestiona tus máquinas virtuales",
    cards: [
      {
        icon: <Computer sx={{ fontSize: 32 }} />,
        title: "Instancias",
        description: "Crear y gestionar instancias de máquinas virtuales",
      },
      {
        icon: <Storage sx={{ fontSize: 32 }} />,
        title: "Discos",
        description: "Administrar discos persistentes y almacenamiento",
      },
    ],
  },
  storage: {
    title: "Cloud Storage",
    subtitle: "Almacenamiento de objetos escalable",
    cards: [
      {
        icon: <Storage sx={{ fontSize: 32 }} />,
        title: "Buckets",
        description: "Contenedores para almacenar tus objetos",
      },
    ],
  },
}

export default (element, index) => {
    const [value, setValue] = React.useState(-1);
    const [activeMenu, setActiveMenu] = React.useState("dashboard")
    const [expandedMenus, setExpandedMenus] = React.useState<string[]>(["compute"])

    const handleChange = (e) => {
      const newValue = e.target.getAttribute('aria-controls')
      const validate = element?.data[newValue]?.primary ?? ""
      if (!firstLevelPermission(validate)) return
      setValue(Number(newValue) === value? -1 : Number(newValue));
    };

    const printBodyTab = (element, index) => {
        return (
          <CustomTabPanel value={value} index={index} key={index}>
            {printAccordion(element,index)}
          </CustomTabPanel>
        )
    }

      const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
  }

  const handleMenuClick = (menuId: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      toggleMenu(menuId)
    } else {
      setActiveMenu(menuId)
    }
  }

  const currentContent = contentData[activeMenu]
    return (
      <React.Fragment key={index}>
          <Box sx={{ width: '100%', typography: 'body1' }}>
        {/* Drawer */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <Toolbar />
          <Box sx={styles.drawerContainer}>
            <List>
              {menuItems.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem sx={styles.listItem}>
                    <ListItemButton
                      sx={{
                        ...styles.listItemButton,
                        ...(activeMenu === item.id ? styles.listItemButtonActive : {}),
                      }}
                      onClick={() => handleMenuClick(item.id, !!item.submenu)}
                    >
                      <ListItemIcon sx={styles.listItemIcon}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} sx={styles.listItemText} />
                      {item.submenu &&
                        (expandedMenus.includes(item.id) ? (
                          <ExpandLess sx={{ color: "#757575" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#757575" }} />
                        ))}
                    </ListItemButton>
                  </ListItem>

                  {item.submenu && (
                    <Collapse in={expandedMenus.includes(item.id)} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={styles.submenu}>
                        {item.submenu.map((subItem) => (
                          <ListItem key={subItem.id} sx={styles.listItem}>
                            <ListItemButton sx={styles.submenuItem} onClick={() => setActiveMenu(subItem.id)}>
                              <ListItemText primary={subItem.label} sx={styles.submenuText} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={styles.content}>
          <Toolbar />

          <Box sx={styles.contentHeader}>
            <Typography sx={styles.pageTitle}>{currentContent.title}</Typography>
            <Typography sx={styles.pageSubtitle}>{currentContent.subtitle}</Typography>
          </Box>

          {activeMenu === "dashboard" && (
            <Card sx={styles.welcomeCard}>
              <CardContent>
                <Typography sx={styles.welcomeTitle}>Te damos la bienvenida</Typography>
                <Typography sx={styles.welcomeText}>
                  Estás trabajando en tu proyecto de la nube. Explora los servicios disponibles y comienza a construir
                  aplicaciones escalables y seguras.
                </Typography>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={3}>
            {currentContent.cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={styles.serviceCard}>
                  <CardContent>
                    <Box sx={styles.cardIcon}>{card.icon}</Box>
                    <Typography sx={styles.cardTitle}>{card.title}</Typography>
                    <Typography sx={styles.cardDescription}>{card.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
          </Box>
      </React.Fragment>
    )
}


const printLabelsTabs = (element, index,shared) => {
    const classes = useStyles();
    function a11yProps(index: number) {
      return {
        id: `${index}`,
        'aria-controls': `${index}`,
      };
    }

    const classAssigned = (): string => {
      const isClassActive = Number(shared) === index
      return isClassActive ? `${classes.containerTab} ${classes.clickedButton}` : `${classes.containerTab}` 
    }

    const disabledClassSx = () => {

      let additionalStyles = {} as any

      if (!firstLevelPermission(element?.primary)) {
          additionalStyles.opacity= "0.1 !important"
          additionalStyles.cursor = "not-allowed"
      }

      return {
        ...additionalStyles,
        backgroundColor: `${element?.primary?.background} !important`, 
        backgroundImage: `${getUrlBackground()}`,
      }
    }

    const getUrlBackground = (): string => {
        const hasUrl = `url(${element?.primary?.img}) !important`
        return element?.primary?.img? hasUrl : ''
    }

    return (
      <React.Fragment key={index}>
          <Tab 
              sx={disabledClassSx()} 
              className={classAssigned()} 
              label={element?.primary?.variables} 
              {...a11yProps(index)} />
      </React.Fragment>
    )
}

const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`${index}`}
        aria-labelledby={`${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
}

/* UTILS */ 
/** TODO: QUITAR LA COOKIE DE AQUI PORQUE NO ES EFICIENTE */

/* Props Types */

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};  

printLabelsTabs.propTypes = {
    element: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    shared: PropTypes.object.isRequired,
}