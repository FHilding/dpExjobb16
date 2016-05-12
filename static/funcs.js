//Visual settings for el 
var gas = {
 'connection': new ol.style.Style({
   text: new ol.style.Text({
    text: 'A',
    font: 'normal 18px FontAwesome',
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: 'green',
    })
  })
 }),
 'arc': new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'green',
    width: 2
  })
}),
 'node': new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0e7 ',
    font: 'normal 20px FontAwesome',
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: 'green',
    })
  })   
})};
   //Visual settings for heating
   var heating = {
     'connection': new ol.style.Style({
      text: new ol.style.Text({
        text: 'A',
        font: 'normal 18px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: 'black',
        })
      })
    }),
     
     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        lineDash: [5,1,5],
        width: 2
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7 ',
        font: 'normal 20px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: 'black',
        })
      })   
     })};
   //Visual settings for water
   var water = {
     'connection': new ol.style.Style({
      text: new ol.style.Text({
        text: 'A',
        font: 'normal 18px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: '#0066ff',
        })
      })   
    }),
     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#0066ff',
        lineDash: [5,5],
        width: 3
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7 ',
        font: 'normal 20px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: '#0066ff',
        })
      })   
     })};


     var repairs = new ol.style.Style({
      text: new ol.style.Text({
        text: '\uf0ad',
        font: 'normal 18px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: 'red',
        })
      })
    })

     var installations = new ol.style.Style({
      text: new ol.style.Text({
        text: '\uf1e6 ',
        font: 'normal 18px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: 'black',
        })
      })
    })

     var styles = {'heating':heating, 'gas':gas, 'water':water}

   //Takes the type of network and the object to visualize as input.
   var styleFunction = function(visualize, network_type) {
    return styles[network_type][visualize];
  };

  //Makes HTTP-request to the file, via the python http server.
  //Python http-server is started with: python -m http.server
  function makeRequest (method, url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  //Object containing the combinations of linetypes. Does not include the small link into the house for the water networks.
  var linetypes = {
    'gas': {'big':{'otyp':928000, 'subtyp':80},'main':{'otyp':928000, 'subtyp':1}, 'small':{'otyp':901000, 'subtyp':1}},
    'heating':{'big':{'otyp':602000, 'subtyp':1},'main':{'otyp':602000, 'subtyp':3}, 'small':{'otyp':602000, 'subtyp':4}},
    'water':{'big':{'otyp':808000, 'subtyp':12},'main':{'otyp':808000, 'subtyp':6}, 'small':{'otyp':808000, 'subtyp':2}}
  }
  //"el" aka el

  var pointColors = {
    '933000':{'type':'gas','color':'#006f00'}, '606000':{'type':'heating','color':'#000000'}, 
    '890400':{'type':'water','color':'#0066ff'}, '614000':{'type':'heating','color':'#ff69b4'},
    '804000':{'type':'water','color':'#0066ff'}, '934000':{'type':'gas','color':'#00FF00'},
    '112233':{'type':'installation','color':'black', 'icon':'\uf1e6'}, '123123':{'type':'reparation','color':'red', 'icon':'\uf0ad'}
  }

  var lineColors = {
    '901000':{'type':'gas','color':'#006f00'}, '602000':{'type':'heating','color':'#000000'}, 
    '808000':{'type':'water','color':'#0066ff'},'901000':{'type':'gas','color':'#006f00'},
  }

  var iconSizes = {
    0:'normal 20px FontAwesome',1:'normal 25px FontAwesome', 2:'bold 25px FontAwesome', 3:'normal 30px FontAwesome', 4:'bold 30px FontAwesome'
  }

  init = function() {
  //Requests from all the different text files.
  //To be implemeted: somehow group them together already in the requests-phase.
  requests = {'gasArc':
  makeRequest('GET', '/arc/gas_arcs'),
  'gasNode':
  makeRequest('GET', '/node/gas_arcs_vertices_pgr'),
  'heatArc':
  makeRequest('GET', '/arc/heat_arcs'),
  'heatNode':
  makeRequest('GET', '/node/heat_nodes'),
  'waterArc':
  makeRequest('GET', '/arc/vatten_arc'),
  'waterNode':
  makeRequest('GET', '/node/vatten_arc_vertices_pgr'),
  'heatConn':
  makeRequest('GET', '/conn/heat_cust'),
  'gasConn':
  makeRequest('GET', '/conn/gas_cust'),
  'waterConn':
  makeRequest('GET', '/conn/vatten_cust'),
  'heatmap': 
  makeRequest('GET', '/heatmap'),
  'repairs': 
  makeRequest('GET', '/repairs'),
  'installations': 
  makeRequest('GET', '/installations')
}
Promise
.props(requests)
.then(function(responses) {
  $(function () {
    $('[data-toggle="popover"]').popover()
  })
  layers = {'Arcs': [], 'Nodes': [], 'Connections':[], 'Networks':[], 'Data':[], 'Types':['gas', 'heating', 'water'], 'Clusters':[]}
  layerGroups = [];
  inLayers = {'Arcs': [responses.gasArc, responses.heatArc, responses.waterArc], 'Nodes': [responses.gasNode, responses.heatNode, responses.waterNode], 'Connections':[responses.gasConn, responses.heatConn, responses.waterConn]}
    //inLayers = {'Arcs':responses.Arcs, 'Nodes':responses.Nodes, 'Connections':responses.Connections}
    connection = [] 
    data = []
    network = []
    workLayers = []
    //For each "network type"(nyttighet): creates the data, creates the network, creates connections and adds the layers.
    for (var i = 0; i < layers.Types.length; i++) {
      data.push(dataMaker(inLayers.Arcs[i], inLayers.Nodes[i]));
      //console.log(data[i].arcSource.getFeatures(), 'data')
      network.push(networkMaker(data[i].arcSource.getFeatures(), data[i].nodeSource.getFeatures()));
      layers.Data.push(data[i]);
      //console.log(layers.Data[i].arcSource.getFeatures(), 'lagerdata')
      layers.Networks.push(network[i]);
      connection.push(connectionMaker(inLayers.Connections[i]));
      layerMaker(data[i],layers,connection[i], layers.Types[i], false,false,false, layerGroups, layers.Types[i]+'_Full', false);
      //Stores the raw data
    }
    heatmap = heatmapMaker(responses.heatmap)
    workLayers.push(workCluster(responses.repairs, 'Pågående Reparationer', true, workStyler))
    workLayers.push(workCluster(responses.installations, 'Pågående Installationer', true, workStyler))
    
    map = mapMaker(layerGroups, layers, heatmap, workLayers);   
  })
.catch(function (err) {
  console.error('Augh, there was an error!', err.statusText);
  console.error(err);
});
};


//Creates OL-sources and fills them with freshly read json
function dataMaker(json_arc, json_node){
  var arcSource_in = new ol.source.Vector()
  var nodeSource_in = new ol.source.Vector()
  //console.log(JSON.parse(json_arc), 'jsarc')
  arcSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_arc)))
  nodeSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_node)))
  return {'arcSource': arcSource_in, 'nodeSource':nodeSource_in}
}

//Creates source object and fills it with connections from the json
function connectionMaker(json_connections){
  var connSource_in = new ol.source.Vector()
  connSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_connections)))
  return {'connSource': connSource_in}
}


function networkMaker(inArc, inNode){
  return {'arcArray': inArc, 'nodeArray':inNode}
}

swe_eng = {'full':{
  'water': {'title':'Vattennät', 'arc': 'Ledningar', 'conn': 'Anslutningar'},
  'gas': {'title':'Gasnät','arc':'Ledningar', 'conn':'Anslutningar' },
  'heating': {'title':'Fjärrvärmenät','arc':'Ledningar','conn':'Anslutningar' }},
  'broken':{
    'water': {'title':'Avbrott: Vatten','node': 'Trasig nod: '},
    'gas': {'title': 'Avbrott: Gas','node':'Trasig nod:'},
    'heating': {'title':'Avbrott: Fjärrvärme', 'node':'Trasig nod: ' }}}

// Creates the layers and sets the styles determining the visualization
function layerMaker(data,layers,connection,network,showArc, showNode, showConn,layerGroups,title,bool_broken){

  broken = ''
  if(bool_broken===true){
    broken = 'broken'
  } else{
    broken = 'full'
  }
  tmpArc = new ol.layer.Vector({
    source: data.arcSource,
    style: styleFunction('arc', network),
    visible: showArc,
    network: network,
    title: swe_eng['full'][network]['arc'],
    type: 'arc'
  })

  tmpNode = new ol.layer.Vector({
    source: data.nodeSource,
    style: styleFunction('node', network),
    visible: showNode,
    network: network,
    title: swe_eng[broken][network]['node']+title,
    type: 'node'
  })

  if(bool_broken===false){
    tmpNode.unset('title')
  }
  tmpConn = new ol.layer.Vector({
    source: connection.connSource,
    style: styleFunction('connection',network),
    visible: showConn,
    title: swe_eng['full'][network]['conn'],
    network: network,
    type: 'conn'
  })
  layerGroups.push(new ol.layer.Group({
    'title': swe_eng[broken][network]['title'],
    layers: [tmpArc, tmpNode, tmpConn]
  }))
  layers.Arcs.push(tmpArc)
  layers.Nodes.push(tmpNode)
  layers.Connections.push(tmpConn)
  //If multiple clusters, add clustering vector creation here
}

function workCluster(responses, title, visibility, styleF){
  var workSource = new ol.source.Vector()
  workSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  var clusterSource = new ol.source.Cluster({
    distance: 100,
    source: workSource
  });

  var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    title: title,
    style: styleF,
    visible: true,
    type: 'cluster'
  });
  return clusterLayer
}

function brokenCluster(inConn, visibility, inGroup, styleF){
  var clusterSource = new ol.source.Cluster({
    distance: 200,
    source: inConn
  });

  //console.log(clusterSource)
  //If single cluster creation, keep this layer creation
  var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    title: 'Cluster',
    style: styleF,
    visible: true,
    type: 'cluster'
  });
  inGroup.get("layers").push(clusterLayer)
  layers.Clusters.push(clusterLayer)
}

function polyMaker(feature) {
  var parser = new jsts.io.OL3Parser();
  var tmpgeom = _.map(feature.get('features'), function(num){
    return num.getGeometry().getCoordinates();
  }) 
  var newGeom = new ol.geom.MultiPoint(tmpgeom)
  var jstsGeom = parser.read(newGeom);
  var convexHull = jstsGeom.convexHull();
  var size = feature.get('features').length;
  data = _.countBy(_.map(feature.get('features'), function(num){
    return num.get('dp_otype')
  }), _.identity);
  var color = _.flatten(_.map(data, function(num, key){
    return pointColors[key].color
  }))
  style =  new ol.style.Style({
    geometry: parser.write(convexHull),
    text: new ol.style.Text({
      text: size.toString(),
      fill: new ol.style.Fill({
        color: '#ffffff'
      })
    }),
    fill: new ol.style.Fill({
      color: hexToRgbA(color.toString())

    })
  })
  return style;
}


function hexToRgbA(hex){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.3)';
  }
  throw new Error('Bad Hex');
}

// Creates the final map, along with two mouse events.
// To-do: Set correct data on load.
function mapMaker(inGroups, inLayers, heatmap, workLayers){
  proj4.defs("EPSG:3006","+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  var myProjection = ol.proj.get('EPSG:3006');
  var raster = new ol.layer.Tile({  
    type:'base',
    title:'Bakgrund', 
    source: new ol.source.XYZ({
      tileSize: [512, 512],
      url: 'https://api.mapbox.com/styles/v1/fhilding/cin084lbc004mc9maksu66pyt/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmhpbGRpbmciLCJhIjoiY2luMDgyMXB3MDBubXY5bHlsZ3d0NXpuMCJ9.YzM1KUyixi_b2Vl1CF0e2g',
      crossOrigin: 'anonymous'
    })
  });
  var basemap = new ol.layer.Group({ 'title': 'Basemap', layers: [raster]})
  var heatmapGroup = new ol.layer.Group({ 'title': 'Gamla Avbrott', layers: [heatmap]})
  var repairsGroup = new ol.layer.Group({ 'title': 'Pågående aktiviteter', layers: workLayers})
  ol.proj.addProjection(myProjection);
  var map = new ol.Map({
    layers: _.flatten([basemap, heatmapGroup, repairsGroup,inGroups]),
    target: 'map',
    interactions : ol.interaction.defaults({doubleClickZoom :false}).extend([new ol.interaction.MouseWheelZoom({duration :500})]),
    view: new ol.View({
      center: [670162.497556056,6579305.28607494],
      resolution: 10,
      projection: myProjection,
      resolutions: [10,5,4,3,2,1.5,1,0.5,0.25]

    })
  });
  var element = document.getElementById('popup');
  var popup = new ol.Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false
  });
  map.addOverlay(popup);

  var layerSwitcher = new ol.control.LayerSwitcher({target: 'bg1',
        tipLabel: 'Legend' // Optional label for button
      });
  map.addControl(layerSwitcher);

  //To extract info about what you click on
  map.on('singleclick', function(evt) {                         
    console.log(map.getView().getResolution());
    var feature = map.forEachFeatureAtPixel(evt.pixel,
     function(feature, layer) {
      popupMaker(feature,popup)
    });                                                         
  });

  map.getLayers().forEach(function(layerGroup) {
    if(layerGroup.getLayers().getArray()[0] instanceof ol.layer.Vector){      
      _.each(layerGroup.getLayers().getArray(), function(layer){
        if(layer.get("type")==='node'){
          bindNodeInputs(layer, inLayers, map, inGroups);
        }
      })
    }
  }); 

  map.on('dblclick', function(evt) {    
    var networkType = map.forEachLayerAtPixel(evt.pixel,
     function(layer) {
      if(layer instanceof ol.layer.Vector){
        deleteLayers(inLayers, layer, map, inGroups)
      }
    },null, function(layer) {
      return _.contains(inLayers.Arcs, layer);
    });
  }); 
  //UPDATE heat_nodes SET gid=post.id FROM heat_arcs_vertices_pgr post WHERE ST_intersects(heat_nodes.the_geom, ST_Buffer(post.the_geom,0.5))
  //When zooming, re-assesses what data to show, depending on the current resolution.
  map.getView().on('change:resolution', function(e) {
    console.log(e.oldValue);
    var cur_res = e.target.get('resolution');
    var restraints = resolutionEvaluator(cur_res,inLayers);
    trimData(restraints, inLayers, inGroups);
    $(element).popover('destroy');
  });

  map.on('pointermove', function(e) {
    if (e.dragging) {
      $(element).popover('destroy');
      return;
    }
  });

}
//'703000':['el','#006f00'], '606000':['heating','#000000'], '890400':['water','#0066ff']
function popupMaker(feature,popup){
  var coord
  var title = "2"
  var content = "1"
  //If polygon
  if(typeof feature.get('features') != 'undefined'){
    data = _.countBy(_.map(feature.get('features'), function(num){
      return num.get('dp_otype')
    }), _.identity);
    console.log(data)
    title = 'I am a Cluster',
    content = 'containing: '.concat(_.flatten(_.map(data, function(num, key){
      return pointColors[key].type + ":" + num + "st"
    })))
    console.log(content)
    coord = feature.getGeometry().getCoordinates()
  } else {
    if(feature.getGeometry().getType() == 'Point'){
      title = 'I am a '.concat(feature.getGeometry().getType())
      content = 'Of the type: '.concat(pointColors[feature.get("dp_otype")].type)
      coord = feature.getGeometry().getCoordinates()
    } else {
      title = 'I am a '.concat(feature.getGeometry().getType())
      console.log(feature.get("dp_otype"), lineColors)
      content = 'Of the type: '.concat(lineColors[feature.get("dp_otype")].type)
      coord = feature.getGeometry().getCoordinateAt(0.5)      
    }
  }
  console.log(title, content, coord)
  popup.setPosition(coord);
  $(popup.getElement()).attr( 'data-placement', 'top' );
  $(popup.getElement()).attr( 'data-original-title', title );
  $(popup.getElement()).attr( 'data-content', content);
  $(popup.getElement()).attr( 'data-html', true );
  $(popup.getElement()).popover();
  $(popup.getElement()).popover('show');
}


//Based on the resolution, changes the content in the source of the line- and node layers, thus changing what is drawn.
//Also sets / unsets the visibility of the connections, depending on the layer.
function trimData(restraints, layers, inGroups){
  for (var i = 0; i < layers.Arcs.length; i++) {
    arcs = layers.Arcs[i]
    nodes = layers.Nodes[i]
    networks = layers.Networks[i]
    data = layers.Data[i]
    connections = layers.Connections[i]
    //Clears all current arcs
    arcs.getSource().clear();
    //For each restraint-set(i.e. one per network type)
    _.each(restraints[i]['line'], function(rest){
      //Adds arcs matching the current restriction set
      arcs.getSource().addFeatures(_.filter(networks.arcArray, function(line){
        tmp = line.get('dp_subtype')==linetypes[layers.Types[i]][rest]['subtyp'] && line.get('dp_otype')==linetypes[layers.Types[i]][rest]['otyp']       
        return tmp
      }))
    })
    arcs.getSource().dispatchEvent('removefeature')
    //Extracts so only nodes that intersect a currently drawn arc is shown. Not used currently.
    var pointsOnLinesource = _.map(arcs.getSource().getFeatures(), function(line){
      return line.get('gid')
    })
    pointsOnLinesource.sort();
  }
  _.each(inGroups, function(layerGroup){
    if(layerGroup.getLayers().getArray()[0] instanceof ol.layer.Vector){      
      _.each(layerGroup.getLayers().getArray(), function(layer){
        if(layer.get("type")==='conn'){
          if(restraints[0]['connection']==true){
            layer.setVisible(false);
          } else {
            layer.setVisible(false);
          }

        } else if (layer.get("type")==='cluster'){
          if(restraints[0]['connection']==true){
            layer.setVisible(false);
          } else {
            layer.setVisible(true);
          }
        }
      })
    }
  })
    //Shows connections for the correct zoom-levels.


    // Om vi skall visa upp noder, slutför förändringen här
    // Restraints innehåller inget om connectivity nu - är det verkligen relevant? Blev inga bra visualiseringar.
    /*
    _.each(restraints, function(rest){
      nodes.getSource().addFeatures(_.filter(networks.nodeArray, function(point){ 
        if(point.get('connectivity')>restraints.Connect && _.some(point.get('lineArray'), function(x) { return (_.indexOf(pointsOnLinesource, x, true) >= 0) })
        ) {
        return point
        }
      }))
    })*/

  }


  //Decides what to show and to not show based on arbitrary zoom levels.
  function resolutionEvaluator(cur_res,layers){
    restraints = [];
    for (var i = 0; i < layers.Arcs.length; i++) {
      var showLine = [];
      var showCon = false;

      switch (true){
        case (cur_res>=6):
        showLine = [];
        break;
        case (cur_res<6 && cur_res>=4):
        showLine = ['big']
        break;
        case (cur_res<4 && cur_res>=1.5):
        showLine = ['big', 'main']
        break;
        case (cur_res<1.5 && cur_res>=1):
        showLine = ['big', 'main', 'small']
        break;
        case (cur_res<1):
        showLine = ['big', 'main', 'small']
        showCon = true;
        break;
      }
      toShow = {'line': showLine, 'connection': showCon}
      restraints.push(toShow);
    }
    return restraints
  }


// Taken from http://www.acuriousanimal.com/thebookofopenlayers3/chapter03_04_imagecanvas.html
var canvasFunction = function(inFeature, inArray, inColors) {
  var canvas = document.createElement('canvas');
  canvas.id = 'someId';
  var context = canvas.getContext('2d');
  //var canvasWidth = size[0], canvasHeight = size[1];
  canvas.setAttribute('width', 100);
  canvas.setAttribute('height', 100);
  var feat = inFeature;
  var colors = inColors
  var radius = 15;

// Track the accumulated arcs drawn
var totalArc = -90*Math.PI / 180;
var percentToRadians = 1 / 100*360 *Math.PI / 180;
var wedgeRadians;
var coordinate = inFeature.getGeometry().getCoordinates();
var data = inArray; //Placeholder

function drawWedge(coordinate, percent, color) {
    // Compute size of the wedge in radians
    wedgeRadians = percent * percentToRadians;
    // Draw
    //context.save();
    context.beginPath();
    context.moveTo(50, 50);
    context.arc(50, 50, radius, totalArc, totalArc + wedgeRadians, false);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 0;
    context.strokeStyle = '#666666';
    //context.stroke();
    context.restore();
    context.save();
    
    // Accumulate the size of wedges
    totalArc += wedgeRadians;
  }
  var drawPie = function(coordinate, data, colors) {
    for(var i=0;i<data.length;i++){
      drawWedge(coordinate,data[i],colors[i]);
    }
  }
  drawPie(coordinate, data, colors);
  return canvas;            
};

var proportions = function(data) {
  tot = data.length;
  data = _.countBy(data, _.identity);
  data = _.map(data, function(num, key) { return [key, 100*(num/tot)]; })
  return _.object(data);
}

function workStyler(feature) {
  var size = feature.get('features').length;
  var type = feature.get('features')[0].get('dp_otype')
  style = new ol.style.Style({
   text: new ol.style.Text({
    text: pointColors[type].icon,
    font: iconSizes[size%5],
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: pointColors[type].color,
    })
  })
 })
  return style
}


function styleFunc(feature) {
  var size = feature.get('features').length;
  var inputFeatures = feature.get('features');
  var all_otypes = _.map(inputFeatures, function(ol) {
    return ol.get('dp_otype');
  })
  var share_array = _.values(proportions(all_otypes));
  
  var fixedColors = _.map(_.keys(proportions(all_otypes)), function(type) {return pointColors[type].color});
  
  var expCanvas = canvasFunction(feature, share_array, fixedColors);    

  style =  new ol.style.Style({
    image: new ol.style.Icon(({
      img: expCanvas,
      imgSize: [100,100]
    })),
    text: new ol.style.Text({
      text: size.toString(),
      fill: new ol.style.Fill({
        color: '#ffffff'
      })
    })
  });
  return style;
}

function bindNodeInputs(layer, inLayers, inMap, layerGroups) {
  var textbox = $('input#usr');
  textbox.on('change', function() {
    console.log('CHANGE')
    var selectedText = $('#Networks').find("option:selected").text();
    if(layer.get("network") === selectedText.toLowerCase()){
      feature = _.find(layer.getSource().getFeatures(),function(feat){return feat.get("gid").toString()===textbox.val()})
      disableNode(feature, inLayers, inMap, layerGroups)
    }    
  })
};

function disableNode(feature, inLayers, map, layerGroups) {
  networkType = pointColors[feature.get("dp_otype")].type
  requests = {'broken': makeRequest('GET', '/broken/'+networkType+'/'+feature.get("gid"))}
  Promise.props(requests).then(function(responses) {
    console.log(responses.broken)
    if(responses.broken === 'NULL') {
      alert("This node is redundant - no effect.")
    } else {
      responses = JSON.parse(responses.broken)
      tmpLayers = {'Arcs': JSON.stringify(responses.Arc), 'Nodes': JSON.stringify(responses.Node), 'Connections':JSON.stringify(responses.Conn)}
      connection = [] 
      data = []
      network = []
      data.push(dataMaker(tmpLayers.Arcs, tmpLayers.Nodes));
      network.push(networkMaker(data[0].arcSource.getFeatures(), data[0].nodeSource.getFeatures()));
      inLayers.Data.push(data[0]);
      inLayers.Networks.push(network[0]);
      inLayers.Types.push(networkType)
      connection.push(connectionMaker(tmpLayers.Connections));
      conn_id_list = _.map(connection[0].connSource.getFeatures(), function(key, value){
        return key.get("cust_id")
      })
      fillCustomer(conn_id_list, networkType)
      layerMaker(data[0],inLayers,connection[0], networkType, true, true, true, layerGroups, feature.get("gid"), true);
      brokenCluster(connection[0].connSource, true, layerGroups[layerGroups.length-1], polyMaker)      
      //Fixa stöd för grupper
      map.addLayer(layerGroups[layerGroups.length-1])
      layerGroups[layerGroups.length-1].dispatchEvent('change:layers')
      map.render()


      /* Hoppa till midpoint av extent
      Räkna ut extent av view på en viss zoomnivå runt området, välj den som är precis ett större än */
      alertOutage(swe_eng['full'][networkType]['title'], conn_id_list.length, feature.get("gid"));
      $('#zoomButton').click(function() {
        var extent = inLayers.Clusters[inLayers.Clusters.length-1].getSource().getExtent()
        console.log(extent, 'clustxt')
        console.log(map.getView().calculateExtent(map.getSize()), 'mapxt')
        map.getView().fit(extent,map.getSize());
      });
      //zoomButton

    }
  })
};

function heatmapMaker(responses){
  var heatSource = new ol.source.Vector()
  heatSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  heatLayer = new ol.layer.Heatmap({
    source: heatSource,
    visible: false,
    title: 'Avbrottshistorik',
    type: 'Old',
    radius: 5,
    opacity: 0.8
  })
  return heatLayer
}
/*
function workMaker(responses, title, style){
  var workSource = new ol.source.Vector()
  workSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  workLayer = new ol.layer.Vector({
    source: workSource,
    visible: true,
    title: title,
    type: 'Repair',
    style: style
  })
  return workLayer
}*/

function fillCustomer(gidList, network_type){
  var table = document.getElementById("custTable");
  console.log(gidList, 'inList')
  requests = {'cust': makeRequest('GET', '/menu/cust/('+gidList+')')}
  Promise.props(requests).then(function(responses) {
    customerArray = JSON.parse(responses.cust)
    console.log(customerArray)
    console.log(customerArray[0])
    console.log(customerArray[0].address)
    for(i=0; i<customerArray.length; i++) {
      var row = custTable.insertRow(i);
      row.insertCell(0).innerHTML="<p>"+customerArray[i].gid+"</p>";
      row.insertCell(1).innerHTML="<p>"+customerArray[i].firstname+"</p>";
      row.insertCell(2).innerHTML="<p>"+customerArray[i].lastname+"</p>";
      row.insertCell(3).innerHTML="<p>"+customerArray[i].address+"</p>";

     }
    //Returns nothing at the moment. Either fill table from here, or return and call secondary function that fills the table?
  })};

  function deleteLayers(inLayers, layer, map, layerGroups){
    console.log(layer, 'inLayer')
    layerType = {'arc': inLayers.Arcs, 'node': inLayers.Nodes, 'conn':inLayers.Connections}
    index = _.indexOf(layerType[layer.get('type')], layer)
    console.log(layerType, 'type')
    console.log(index, 'index')
    console.log(map.getLayers(), 'layersMap')
    console.log(inLayers, 'inLayers')
    _.each(inLayers, function(value, key){
      if(key !== 'Clusters' && index >= 3){
        map.removeLayer(layerGroups[index])
        value.splice(index,1)
        map.render()
      }
    });
  }