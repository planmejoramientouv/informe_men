/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import For from '../../../../share/utils/For'
import printAccordion from './Accordion'

// Tabs
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';

// Material - IU
import Box from '@mui/material/Box';

export default (element, index) => {
    const [value, setValue] = React.useState(-1);

    const handleChange = (e) => {
      const newValue = e.target.getAttribute('aria-controls')
      setValue(Number(newValue) === value? -1 : Number(newValue));
    };

    const printBodyTab = (element, index) => {
        return (
          <CustomTabPanel value={value} index={index} key={index}>
            {printAccordion(element,index)}
          </CustomTabPanel>
        )
    }

    return (
      <React.Fragment key={index}>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <Box>
              <Tabs sx={styles.tabs} value={0} onClick={handleChange} aria-label="tab">
                  <Tab id="0" sx={styles.tabHiddent}/>
                  <For func={printLabelsTabs} list={element?.data} shared={value}/>
              </Tabs>
            </Box>
          </Box>
          <For func={printBodyTab} list={element?.data}/>
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

    const getUrlBackground = (): string => {
        const hasUrl = `url(${element?.primary?.img}) !important`
        return element?.primary?.img? hasUrl : ''
    }

    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission()}>
          <Tab 
              sx={{ 
                backgroundColor: `${element?.primary?.background} !important`, 
                backgroundImage: `${getUrlBackground()}`
              }} 
              className={classAssigned()} 
              label={element?.primary?.variables} 
              {...a11yProps(index)} />
        </Show>
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

const firstLevelPermission = (): boolean => {
    return true
}

const styles = {
    tabs: {
        '& > div > div': {
            gap: '20px',
            '& > button:nth-of-type(2)': {
                marginLeft: '-20px',
            },
        },
        '& > div > span.MuiTabs-indicator': {
            display: 'none !important'
        }
    },
    tabHiddent: {
        opacity: '0', 
        all: 'unset', 
        width: 0
    }
}

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