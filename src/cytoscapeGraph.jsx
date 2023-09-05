import { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import ZoomOutMapTwoToneIcon from '@mui/icons-material/ZoomOutMapTwoTone';
import { FormControlLabel, FormGroup, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import styled from '@emotion/styled';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import companyImage from './assets/icons/icon_company_black.svg';
import companyImageWhite from './assets/icons/icon_company_white.svg';
import personImage from './assets/icons/icon_person_black.svg';
import personImageWhite from './assets/icons/icon_person_white.svg';
import vesselImage from './assets/icons/icon_vessel_black.svg';
import vesselImageWhite from './assets/icons/icon_vessel_white.svg';
import data from './assets/data/sample.json';

import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

cytoscape.use(popper);


export const CytoscapeGraph = props => {

  let [selectedId, setselectedId] = useState('a');
  let [selectedName, setselectedName] = useState('');
  let [selectedLabel, setselectedLabel] = useState('');
  let [graphType, setGraphType] = useState('circle');
  
  const graphRef = useRef(null);
  const [showEntityRelationships, setShowEntityRelationships] = useState(false);
  const [cysto, setcysto] = useState({});
  const [uncheckedGroups, setUncheckedGroups] = useState([]);
  const groups = ["person", "vessel", "company"]
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let cy;

  let nodes = data.nodes;
  let edges = data.edges;

  const NodeIcons = {
    person: { blueImage: personImage, whiteImage: personImageWhite, bgColor: '#90A6B9' },
    vessel: { blueImage: vesselImage, whiteImage: vesselImageWhite, bgColor: '#225B7B' },
    company: { blueImage: companyImage, whiteImage: companyImageWhite, bgColor: '#C39D63' }
  }

  
  const onClickNode = (id) =>{
    setselectedId(id);
  }

  const StyledIcon = styled(Icon)(() => ({
    marginRight: '0.25rem'
  }));
 
  const backgroundImageForNode = (label) => {
    return {
      selector: "node[label='" + label + "']",
      style: {
        backgroundImage: "url(" + NodeIcons[label].blueImage + ")",
        backgroundColor: "#fff",
        textBackgroundColor: NodeIcons[label].bgColor,
        color: "#fff",
      }
    }
  };


  const getNodeIcon = (id) => {
    let type = nodes?.filter(x => x.data.id === id)[0].data.label;
    return NodeIcons[type].whiteImage;
  };

  const onZoomIn = () => {
    cysto.zoom(cysto.zoom() + 0.2);
  };

  const onZoomOut = () => {
    cysto.zoom(cysto.zoom() - 0.2);
  };

  const onFitToPage = () => {
    cysto.animate({
      fit: {
        eles: graphRef,
        padding: 20
      }
    }, {
      duration: 100
    });
  };

  const showAllEntityRelationships = (event) => {
    const isChecked = event.target.checked;
    cysto.edges().forEach(function (ele) {
      isChecked ? ele.tippy.show() : ele.tippy.hide();
    });
    setShowEntityRelationships(isChecked);
  };
  
  const groupSelected = (group, isSelected ) => {
    if(!isSelected) {
      let groups = [...uncheckedGroups];
      groups.push(group);
      setUncheckedGroups(groups);
    } else {
      let groups = [...uncheckedGroups];
      groups.pop(group);
      setUncheckedGroups(groups);
    }
    
  }
    
  const drawGraph = () => {
    cy = cytoscape({
      container: graphRef.current,
      avoidOverlap: true,
      style: [
        {
          selector: 'node[id!="' + selectedId + '"]',
          style: {
            label: 'data(name)',
            width: 50,
            height: 50,
            textValign: 'bottom',
            textHalign: 'center',
            borderColor: 'rgba(0,0,0,0.22)',
            borderWidth: 3,
            borderOpacity: '0.03',
            textBackgroundOpacity: '1',
            textBorderWidth: '15px',
            textBackgroundPadding: ' 5px ',
            "text-rotation": "autorotate",
            "text-margin-x": "data(xalign)",
            "text-margin-y": "data(yalign)"
          }
        },
        {
          selector: 'edge',
          style: {
            curveStyle: "unbundled-bezier",
            lineColor: "#2e2e2d",
            targetArrowColor: "#2e2e2d",
            targetArrowShape: "triangle",
            color: 'black',
            //content: '\u24D8',
            fontSize: '20px',
            textBackgroundColor: '#fff',
            textBackgroundOpacity: '1',
            textBackgroundShape: "round-rectangle",
          }
        },
        backgroundImageForNode('company'),
        backgroundImageForNode('vessel'),
        backgroundImageForNode('person'),
        {
          selector: 'node[id="' + selectedId + '"]',
          style: {
            label: 'data(name)',
            width: 50,
            height: 50,
            borderWidth: 3,
            borderColor: '#05A07E',
            textValign: 'bottom',
            textHalign: 'center',
            textBackgroundPadding: ' 5px ',
            textBackgroundColor: '#05A07E',
            textBackgroundOpacity: '1',
          }
        },
      ],
      layout: {
        name: graphType,
       // rows: 4
       fit: true
      },
      elements: {
        nodes: nodes,
        edges: edges
      }
    });

    function makePopper(ele) {
      let ref = ele.popperRef(); // used only for positioning
      let dummyDomEle = document.createElement('div');
      ele.tippy = new Tippy(dummyDomEle, {
        // tippy options:
        theme: 'blue',
        getReferenceClientRect: ref.getBoundingClientRect,
        content: () => {
          let contentdiv = document.createElement("div");
          let ctent = renderToString(<Box style={{  color: '#fff', padding: '10px' }}>
            <Box className="tippy-map" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '' }}>
              <Box style={{ width: '32px', height: '32px', textAlign: 'center' }}>
                <StyledIcon>
                  <img src={getNodeIcon(ele.data().source)} height="20px" alt="source-icon" />
                </StyledIcon>
              </Box>
              <Box style={{ width: '32px', height: '32px', textAlign: 'center' }} >{">"}</Box> 
              <Box style={{ width: '32px', height: '32px', textAlign: 'center' }}> 
                <StyledIcon>
                  <img src={getNodeIcon(ele.data().target)} height="20px" alt="target-icon" />
                </StyledIcon>
              </Box>
            </Box>
            <Divider light style={{ borderColor: '#fff' }} ></Divider>
            <List style={{ paddingLeft: '15px', listStyleType: 'circle' }}>
               <ListItem style={{ paddingLeft: '0', listStyleType: 'circle', color: 'white' }}>{ele.data()?.relationship || " is connected "}</ListItem>
             </List>
          </Box>);
          contentdiv.innerHTML = ctent;
          return contentdiv;
        },
        trigger: "manual",
        placement: "bottom",
        hideOnClick: false,
      });
    } 
    cy.container().style.cursor = 'pointer';

    cy.bind('click', 'node', function (evt) {
      handleOpen();
      onClickNode(evt.target.id());
      setselectedName(evt.target.data().name)
      setselectedLabel(evt.target.data().label)
    });

    cy.bind('click', 'edge', function (ele) {
     ele.target.tippy.show()
    });

    cy.edges().forEach(function (ele) {
     makePopper(ele);
    });

    uncheckedGroups.forEach(function (ele) {
      var collection = cy.elements("node[label='"+ele+"']");
      cy.remove( collection );
    })
    
    cy.edges().unbind("mouseover");
    cy.edges().bind("mouseover", event => event.target.tippy.show());
     cy.edges().unbind("mouseout");
     cy.edges().bind("mouseout", event => event.target.tippy.hide());
    setcysto(cy);
    
  }

  useEffect(() => {
   // cy = cysto;
    drawGraph();
  }, [selectedId, data, graphType, uncheckedGroups]);

  return ( <>
    <Grid container spacing={5} >
      <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
      </Grid>
      <Grid item xs={3}>
        <Card raised elevation={2} >
          <CardContent>
            <Grid container justifyContent="center" spacing={8}>
              <Grid item xs={12}>
                <Typography variant="h6" color="secondary" style={{ fontWeight: 400, marginBottom: '20px' }}>
                  Tools
                </Typography>
                <InputLabel id="label" style={{ marginBottom: '15px' }}>Layout</InputLabel>
                <Select labelId="label" id="select" value={graphType} onChange={(e)=>setGraphType(e.target.value)} fullWidth>
                  <MenuItem value="random">Random</MenuItem>
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="breadthfirst">Breathfirst</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
            <Grid container justifyContent="center" paddingTop="20px">
              <Grid item xs={12}>
                <InputLabel id="label" style={{ marginBottom: '15px' }}>Options</InputLabel>
              </Grid>
              <Grid item xs={6} style={{ paddingTop: 0 }}>
                <AddBoxIcon style={{ fontSize: '40px', color: '#90A6B9' }} onClick={onZoomIn} />
                <IndeterminateCheckBoxIcon style={{ fontSize: '40px', color: '#90A6B9' }} onClick={onZoomOut} /><InputLabel>Zoom In / Out</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <ZoomOutMapTwoToneIcon style={{ fontSize: '40px', color: '#90A6B9' }} onClick={onFitToPage} /><InputLabel>Fit to Page</InputLabel>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
            <Grid container justifyContent="center" paddingTop="20px">
              <Grid item xs={12}>
                <InputLabel id="label" style={{ marginBottom: '15px' }}>Grouping</InputLabel>
              </Grid>
              <Grid item >
                <FormGroup>
                 { groups.map( x=>(<FormControlLabel control={<Switch
                    size={"small"}
                    defaultChecked
                    onChange={event => groupSelected(x,event.target.checked)}
                  />} label={x} />)) }
                </FormGroup>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" spacing={0} paddingTop="20px" >
              <Grid item spacing={0} md={6}>
                <InputLabel id="label" style={{ marginBottom: '15px' }}>Node's Relationships</InputLabel>
              </Grid>
              <Grid item  style={{ paddingTop: 0, textAlign: 'right' }}>
                <FormGroup>
                  <FormControlLabel control={<Switch
                    size={"small"}
                    checked={showEntityRelationships}
                    onChange={event => showAllEntityRelationships(event)}
                  />} label="Show All" />
                </FormGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={9}>
        <div ref={graphRef} style={{ width: '100%', height: '100%' }}>
        </div>
      </Grid>
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
             {selectedName}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {selectedLabel}
            </Typography>
          </Box>
        </Modal>
      </div>
    </Grid>
  </>
  );
};
