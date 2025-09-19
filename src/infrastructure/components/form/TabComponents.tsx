"use-client"
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
import PrintAccordion from './Accordion'

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

import Info from '@mui/icons-material/Info'
import School from '@mui/icons-material/School'
import EventNote from '@mui/icons-material/EventNote'
import Build from '@mui/icons-material/Build'
import People from '@mui/icons-material/People'
import HomeWork from '@mui/icons-material/HomeWork'
import AccountBalance from '@mui/icons-material/AccountBalance'
import DownloadDoc from '../Docs/Docs'

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
    zIndex: 12,
    width: drawerWidth,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      borderRight: "1px solid #e0e0e0",
    },
    '& .MuiPaper-root': {
      height: "calc(100% - 80px)",
      bottom: 0,
      top: 'unset',
    }
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
    minHeight: "calc(100vh - 80px)",
    maxWidth: "calc(100vw - 280px)",
    '& .MuiGrid2-root': {
      backgroundColor: "red",
      maxWidth: "calc(100vw - 280px)",
    }
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
  subsubmenu: {
    backgroundColor: "#f5f5f5",          
    borderLeft: "2px solid #d6d6d6",     
    ml: 4,                            
  },
  subsubmenuItem: {
    pl: 6,
    minHeight: 36,
    "&:hover": {
      backgroundColor: "#e0e0e0",   
    },
  },
  subsubmenuText: {
    "& .MuiListItemText-primary": {
      fontSize: "12px",              
      color: "#757575",
    },
  },
}

export default ({ element, index }) => {
    const [value, setValue] = React.useState(-1);
    const [activeMenu, setActiveMenu] = React.useState(0)
    const [expandedMenus, setExpandedMenus] = React.useState<number[]>([0])
    const [expandedSubMenus, setExpandedSubMenus] = React.useState<string[]>([]);
    const [hydrated, setHydrated] = React.useState(false);

    const subMenuItems = (data) => {
      if (!Array.isArray(data)) return [];

      const itemFiltered = data.filter((item) => item?.menu);
      const itemFilteredDominacion = data.filter((item) => item?.menu === `${(item?.menu)?.replace("-", "")}-`);

      const subMenu = itemFilteredDominacion.map((subItem) => {
        const rawMenuKey = (subItem?.menu || "").replace("-", "");
        const children = itemFiltered.filter(
          (cand) => cand?.menu === `${rawMenuKey}.1`
        );

        return {
          id: subItem.id,
          label: subItem.variables,
          primary: subItem.primary,
          secondary: subItem.secondary,
          menu: subItem.menu,
          children: children.map((child) => ({
            id: child.id,
            label: child?.texto,
            primary: child.primary,
            secondary: child.secondary,
            menu: child.menu,
          })),
          hasChildren: children.length > 0,
        };
      });

      return subMenu;
    };

    const menuItems = element?.map((item, idx) => ({
      id: String(idx),
      label: item?.primary?.variables,
      icon: <Settings />,
      submenu: subMenuItems(item?.data) || [],
            hasSubmenu: Array.isArray(item?.data)
        ? subMenuItems(item.data).length > 0
        : false,
    })) || [];

    const handleChange = (e) => {
      const newValue = e.target.getAttribute('aria-controls')
      const validate = element?.data[newValue]?.primary ?? ""
      if (!firstLevelPermission(validate)) return
      setValue(Number(newValue) === value? -1 : Number(newValue));
    };

    const toggleMenu = (menuId: string) => {
      //@ts-ignore
      setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
    }

    const iconList = [
      <Settings />,     
      <Info />,
      <School />,
      <EventNote />,
      <Build />,
      <People />, 
      <HomeWork />,
      <Security />,
      <AccountBalance />,
      <Settings />,
    ]

    const handleMenuClick = (menuId: string, hasSubmenu: boolean, index: number) => {
      if (hasSubmenu) {
        toggleMenu(menuId)
      } 
      setActiveMenu(Number(index))
    }

    const handleSubMenuClick = (parentMenuId, subItem, parentIdx, subIdx) => {
      const subMenuKey = `${parentMenuId}-${subItem.id}`;
      if (subItem.hasChildren) {
        setExpandedSubMenus((prev) =>
          prev.includes(subMenuKey)
            ? prev.filter((id) => id !== subMenuKey)
            : [...prev, subMenuKey]
        );
      } 
      setActiveMenu(parentIdx);
    };

    React.useEffect(() => {
        setHydrated(true);
    }, []);
    console.log("Element: 45", menuItems)
    if (!hydrated) return null;

    return (
        <React.Fragment key={index}>
          <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
            {/* Drawer */}
            <Drawer variant="permanent" sx={styles.drawer}>
              <Box sx={styles.drawerContainer}>
                <List>
                  {menuItems.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {/* === Menú Principal === */}
                      <ListItem sx={styles.listItem}>
                        <ListItemButton
                          sx={{
                            ...styles.listItemButton,
                            ...(activeMenu === idx
                              ? styles.listItemButtonActive
                              : {}),
                          }}
                          onClick={() =>
                            handleMenuClick(item.id, item.hasSubmenu, idx)
                          }
                        >
                          <ListItemIcon sx={styles.listItemIcon}>
                            {iconList[idx]}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            sx={styles.listItemText}
                          />
                          {/* Mostrar flecha SOLO si hay submenú y su longitud > 0 */}
                          {item.hasSubmenu && item.submenu.length > 0 && (
                            expandedMenus.includes(item.id) ? (
                              <ExpandLess sx={{ color: "#757575" }} />
                            ) : (
                              <ExpandMore sx={{ color: "#757575" }} />
                            )
                          )}
                        </ListItemButton>
                      </ListItem>

                      {/* === Submenú (Primer Nivel) === */}
                      {item.submenu.length > 0 && (
                        <Collapse
                          in={expandedMenus.includes(item.id)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding sx={styles.submenu}>
                            {item.submenu.map((subItem, subIdx) => {
                              const subMenuKey = `${item.id}-${subItem.id}`;
                              return (
                                <React.Fragment key={subItem.id}>
                                  <ListItem sx={styles.listItem}>
                                    <ListItemButton
                                      sx={styles.submenuItem}
                                      onClick={() =>
                                        handleSubMenuClick(
                                          item.id,
                                          subItem,
                                          idx,
                                          subIdx
                                        )
                                      }
                                    >
                                      <ListItemText
                                        primary={subItem.label}
                                        sx={styles.submenuText}
                                      />
                                      {/* Flecha de sub‐submenú (segundo nivel) */}
                                      {subItem.hasChildren &&
                                        subItem.children.length > 0 && (
                                          expandedSubMenus.includes(subMenuKey) ? (
                                            <ExpandLess sx={{ color: "#757575" }} />
                                          ) : (
                                            <ExpandMore sx={{ color: "#757575" }} />
                                          )
                                        )}
                                    </ListItemButton>
                                  </ListItem>

                                  {/* === Sub‐Submenú (Segundo Nivel) === */}
                                  {subItem.children.length > 0 && (
                                    <Collapse
                                      in={expandedSubMenus.includes(subMenuKey)}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <List
                                        component="div"
                                        disablePadding
                                        sx={styles.subsubmenu}
                                      >
                                        {subItem.children.map((child) => (
                                          <ListItem
                                            key={child.id}
                                            sx={styles.listItem}
                                          >
                                            <ListItemButton
                                              sx={styles.subsubmenuItem}
                                              onClick={() => {
                                              
                                                setActiveMenu(idx);
                                              }}
                                            >
                                              <ListItemText
                                                primary={child.label}
                                                sx={styles.subsubmenuText}
                                              />
                                            </ListItemButton>
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Collapse>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ pb: 10, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <DownloadDoc />
                {element?.[activeMenu] != null && (
                  [ element[activeMenu] ]?.map((el, idx) => (
                    <PrintBodyTab key={idx} element={el} index={idx} />
                  )
                ))}
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

const PrintBodyTab = ({ element, index }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto'}} key={index}>
      <PrintAccordion 
        element={element}
        index={index}
      />
    </Box>
  )
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