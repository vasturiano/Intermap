define([
    'react',
    'react-dom',
    'jquery',
    'underscore',
    'cytoscape',
    'cytoscape-panzoom',
    'colors'
], function(React, ReactDOM, $, _, cytoscape, panzoom, Colors) {

    panzoom(cytoscape, $); // Register panzoom

    function graphRandomGenerator(nNodes, nEdges) {
        var nodes = [],
            edges = [];

        nNodes = Math.max(nNodes, 1);
        nEdges = Math.abs(nEdges);

        while(nEdges--) {
            edges.push({
                src: Math.round((nNodes-1)*Math.random()),
                dst: Math.round((nNodes-1)*Math.random()),
                type: 'peer'
            });
        }
        while(nNodes--) {
            nodes.push({
                asn: nNodes,
                customerConeSize: Math.random(),
                lat: Math.random()*180 - 90,
                lon: Math.random()*360 - 180,
                orgName: 'bla'
                //x: Math.random(),
                //y: Math.random()
            });
        }

        //console.log('finished random gen');
        return {
            ases: nodes,
            relationships: edges
        }
    }

    var CytoscapeGraph = React.createClass({

        const: {
            REFRESH_STYLE_FREQ: 400, // ms
            MIN_EDGE_WIDTH: 0.15,
            MAX_EDGE_WIDTH: 0.25,
            NODE_SIZE: 2
        },

        componentDidMount: function() {
            var props = this.props,
                consts = this.const;
            var size_max = 1;
            for (var i = 0; i < props.edges.length; i++) {
                var size = props.edges[i]["customerConeSize"];
                if (size != null) {
                    size_max = size;
                }
            }

            var cs = this._csGraph = cytoscape({
                container: ReactDOM.findDOMNode(this),
                layout: {
                    name: 'preset',
                    fit: false
                },
                minZoom: 1,
                maxZoom: 100,
                autoungrabify: true,
                autolock: true,
                hideEdgesOnViewport: true,
                hideLabelsOnViewport: true,
                textureOnViewport: true,
                motionBlur: true,
                style: [
                    {
                        selector: 'node',
                        style: {
                            width: this.const.NODE_SIZE,
                            height: this.const.NODE_SIZE,
                            'border-width': this.const.NODE_SIZE*.1,
                            'border-color': 'orange',
                            'background-color': 'yellow',
                            'background-opacity': .3, //.2,

                            //'content': 'data(name)',
                            //'font-size': '11px',
                            //'font-weight': 'bold',
                            //'color': '#337AB7'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'curve-style': 'haystack', // 'bezier', //'haystack',
                            width: .05,
                            'opacity': function (ele) { 
                                return ele.data('opacity')},
                            'line-color': function (ele) { 
                                return ele.data('color') }
                            //'target-arrow-shape': 'triangle',
                            //'overlay-color': '#c0c0c0',
                            //'overlay-padding': '2px',
                            //'overlay-opacity': 40

                        }
                    }
                ],
                elements: {
                    nodes: props.nodes.map(function(node) {
                        var nodeData = $.extend({id: node.id}, node.nodeData);
                        return {
                            data: $.extend({id: node.id}, node.nodeData),
                            position : {
                                x: node.x,
                                y: node.y
                            }
                        };
                    }),
                    edges: props.edges.map(function(edge) {
                        return {
                            data: {
                                source: edge.src,
                                target: edge.dst,
                                color: Colors.valueRgb(edge.customerConeSize, size_max),
                                opacity: Colors.valueOpacity(edge.customerConeSize, size_max)
                            }
                        };
                    })
                }
            })
                .on('zoom', function() {
                    adjustElementSizes();
                    zoomOrPan();
                })
                .on('pan', zoomOrPan)
                .on('mouseover', 'node', function() {
                    props.onNodeHover(this.data());
                })
                .on('select', 'node', function() {
                    props.onNodeClick(this.data());
                });

            // console.log('cytoscape add nodes/edges');

            cs.panzoom({
                zoomFactor: 0.1, // zoom factor per zoom tick
                zoomDelay: 50, // how many ms between zoom ticks
                minZoom: 1, // min zoom level
                maxZoom: 100, // max zoom level
                fitPadding: 0, // padding when fitting
                panSpeed: 20, // how many ms in between pan ticks
                panDistance: 40 // max pan distance per tick
            });

            function zoomOrPan() {
                var pan = cs.pan();
                props.onZoomOrPan(cs.zoom(), pan.x, pan.y);
            }

            var adjustElementSizes = _.debounce(this.resetStyle, consts.REFRESH_STYLE_FREQ);
        },

        componentWillReceiveProps: function(nextProps) {
            /*if (nextProps.nodes !== this.props.nodes) {
                this._csGraph.add(this.props.nodes.map(function(node, idx) {
                    return {
                        data: {
                            id: idx
                        },
                        position : {
                            x: node.x,
                            y: node.y
                        }
                    };
                }));
            }
            if (nextProps.edges !== this.props.edges) {
                this._csGraph.add(this.props.edges.map(function(edge) {
                    return {
                        data: {
                            source: edge.src,
                            target: edge.dst
                        }
                    };
                }));
            }*/


        },

        render: function() {
            return <div style={{width: this.props.width, height: this.props.height}}/>;
        },

        zoom: function(ratio) {
            this._csGraph.zoom(ratio);
        },

        pan: function(x, y) {
            this._csGraph.pan({x: x, y: y});
        },

        getNodeById: function(id) {
            return this._csGraph.getElementById(id);
        },

        resetStyle: function() {
            var cs = this._csGraph,
                zoom = cs.zoom(),
                nodeSize = this.const.NODE_SIZE/zoom;
            cs.style()
                .selector('node')
                .style({
                    width: nodeSize,
                    height: nodeSize,
                    'border-width': this.const.NODE_SIZE*.1,
                    'border-color': 'orange',
                    'background-color': 'yellow',
                    'background-opacity': .3, //.2,
                })
                .selector('edge')
                .style({
                    width: Math.min(this.const.MIN_EDGE_WIDTH*zoom, this.const.MAX_EDGE_WIDTH)/zoom
                })
                .update();
        }

    });

    return React.createClass({

        getDefaultProps: function() {
            return {
                graphData: graphRandomGenerator(5, 10),
                width: window.innerWidth,
                height: window.innerHeight,
                margin: 0,
                selectedAs: null
            };
        },

        getInitialState: function() {
            return {
                maxCustomerConeSize: Math.max.apply(null, this.props.graphData.ases.map(function(asNode) {
                    return asNode.customerConeSize
                })),
                radialNodes: this._genRadialNodes(),
                asnNeighborhood: this._genNeighborhoodStructure()
            }
        },

        componentDidMount: function() {
            this.refs.radialGraph.zoom(1);
            this.refs.radialGraph.pan(this.props.width/2, this.props.height/2);
        },

        componentWillReceiveProps: function(nextProps) {
            if (nextProps.width !== this.props.width
                || nextProps.height !== this.props.height
                || nextProps.graphData !== this.props.graphData) {
                this.setState({radialNodes: this._genRadialNodes()});
            }

            if (nextProps.selectedAs !== this.props.selectedAs) {
                //this._highlightNeighborhood(nextProps.selectedAs);
            }
        },

        render: function() {
            return <CytoscapeGraph
                ref="radialGraph"
                nodes={this.state.radialNodes}
                edges={this.props.graphData.relationships}
                width={this.props.width}
                height={this.props.height}
                onZoomOrPan={this._onZoomOrPan}
                onNodeHover={this.props.onAsHover}
                onNodeClick={this.props.onAsClick}
            />;
        },

        _highlightNeighborhood: function(focusAs) {
            var neighborHood = this._getBgpNeighborhood(this.props.selectedAs),
                graph = this.refs.radialGraph,
                csGraph = graph._csGraph;

            console.log(neighborHood);

            var COLORS = {
                self: 'yellow',
                customer: 'blue',
                provider: 'red',
                peer: 'green',
                sibling: 'green'
            };

            graph.resetStyle();

            colorAs(focusAs, COLORS.self);
            neighborHood.customers.forEach(function(asn) { colorAs(asn, COLORS.customer); });
            neighborHood.providers.forEach(function(asn) { colorAs(asn, COLORS.provider); });
            neighborHood.peers.forEach(function(asn) { colorAs(asn, COLORS.peer); });
            csGraph.style().update();

            function colorAs(asn, color) {
                var node = csGraph.getElementById(asn);

                if (!node.length) return;

                var curWidth = node.style('width').split('px')[0];

                csGraph.style()
                    .selector('#'+asn)
                    .style({
                        'background-color': color,
                        width: (8*curWidth)+'px',
                        height: (8*curWidth)+'px',
                        'background-opacity': 1
                    });
            }

        },

        _genRadialNodes: function() {
            var rThis = this;
            var maxR = Math.min(this.props.width, this.props.height) / 2 - this.props.margin;

            var maxConeSize = Math.max.apply(null, this.props.graphData.ases.map(function(asNode) {
                return asNode.customerConeSize
            }));

            return this.props.graphData.ases.map(function(node) {
                var radius = rThis._getRadius(node.customerConeSize, maxConeSize);
                return { // Convert to radial coords
                    id: node.asn,
                    x: maxR * radius * Math.cos(-node.lon*Math.PI/180),
                    y: maxR * radius * Math.sin(-node.lon*Math.PI/180),
                    nodeData: node
                };
            });
        },

        _getRadius: function(coneSize, maxConeSize) {
            // 0<=result<=1
            return (Math.log(maxConeSize)-Math.log(coneSize)) / (Math.log(maxConeSize) - Math.log(1))*0.99 + 0.01;
        },

        _genNeighborhoodStructure: function() {
            var graph = this.props.graphData;
            var to_return = {};
            
            //console.log(Object.keys(graph).length);
            
            for (var i = 0; i < graph["relationships"].length; i++) {
                var rel = graph["relationships"][i];
                if (!(rel["src"] in to_return)) {
                    to_return[rel["src"]]={};
                }
                if (!(rel["dst"] in to_return)) {
                    to_return[rel["dst"]]={};
                }
                if (rel["type"] == "customer") {
                    to_return[rel["src"]][rel["dst"]] = -1;
                    to_return[rel["dst"]][rel["src"]] = 1;
                } else if (rel["type"] == "provider") {
                    to_return[rel["src"]][rel["dst"]] = 1;
                    to_return[rel["dst"]][rel["src"]] = -1;
                } else if (rel["type"] == "peer") {
                    to_return[rel["src"]][rel["dst"]] = 0;
                    to_return[rel["dst"]][rel["src"]] = 0;
                }
            }
                        
            return to_return;
        },

        _getBgpNeighborhood: function(asn) {
            var graph = this.props.graphData,
                neighborHoodStructure = this.state.asnNeighborhood;

            var ccone     = [];
            var pcone     = [];

            var customers = [];
            var providers = [];
            var peers     = [];
            
            var neighbors = [];
            
            console.log(asn);
            
            console.log(neighborHoodStructure[asn]);
            
            var neighbor;
            for (neighbor in neighborHoodStructure[asn]) {
                if (typeof neighbor !== "undefined") {
                    if (neighborHoodStructure[asn][neighbor] == "1") {
                        customers.push(neighbor);
                        ccone.push(neighbor);
                        console.log("customer"+neighbor);
                    } else if (neighborHoodStructure[asn][neighbor] == "-1") {
                        providers.push(neighbor);
                        pcone.push(neighbor);
                        console.log("provider"+neighbor);
                    } else if (neighborHoodStructure[asn][neighbor] == "0") {
                        peers.push(neighbor);
                        console.log("peer"+neighbor);
                    }
                    neighbors.push(neighbor);
                }
            }
            
            console.log(ccone);
            console.log(pcone);
            console.log(peers);
            
            var c;
            while (customers.length > 0) {
                c = customers.pop();
                if (typeof c !== "undefined") {
                    console.log("customer"+c);
                    for (neighbor in neighborHoodStructure[c]) {
                        if (neighborHoodStructure[asn][neighbor] == "1") {
                            if ((ccone.indexOf(neighbor) < 0) && (customers.indexOf(neighbor) < 0)) {
                                customers.push(neighbor);
                            }
                        }
                    }
                    console.log(customers);
                    if (ccone.indexOf(c) < 0) {
                        ccone.push(c);
                    }
                }
            }
            
            var p;
            while (providers.length > 0) {
                p = providers.pop();
                if (typeof p !== "undefined") {
                    console.log("provider"+p);
                    for (neighbor in neighborHoodStructure[p]) {
                        if (neighborHoodStructure[asn][neighbor] == "-1") {
                            if ((pcone.indexOf(neighbor) < 0) && (providers.indexOf(neighbor) < 0)) {
                                providers.push(neighbor);
                            }
                        }
                    }
                    console.log(providers);
                    if (pcone.indexOf(p) < 0) {
                        pcone.push(p);
                    }
                }
            }
            
            //console.log("done")
            
            console.log(ccone);
            console.log(pcone);
            console.log(peers);

            
            return {"customers" : ccone, "providers" : pcone, "peers" : peers, "neighbors" : neighbors};
        },

        _onZoomOrPan: function(zoom, panX, panY) {
            var r = Math.min(this.props.width, this.props.height)/2,
                offsetX = -(panX-this.props.width/2)/zoom/r,
                offsetY = -(panY-this.props.height/2)/zoom/r,
                offsetR = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
                offsetAng = offsetR?-Math.acos(offsetX/offsetR)/Math.PI*180:0,
                zoomRadius = 1/zoom;

            if (offsetY<0) { // Complementary angle
                offsetAng=360-offsetAng;
            }

            this.props.onRadialViewportChange(zoomRadius, offsetR, offsetAng);
        }

    });

});
