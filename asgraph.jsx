define([
    'react',
    'react-dom',
    'jquery',
    'underscore',
    'cytoscape',
    'cytoscape-panzoom',
    'cytoscape-qtip',
    'visjs',
    'sigma'
], function(React, ReactDOM, $, _, cytoscape, panzoom, qtip) {

    panzoom(cytoscape, $); // Register panzoom
    qtip(cytoscape, $); // Register qtip

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
                long: Math.random()*360 - 180,
                orgName: 'bla'
                //x: Math.random(),
                //y: Math.random()
            });
        }

        console.log('finished random gen');
        return {
            ases: nodes,
            relationships: edges
        }
    }

    var SigmaGraph = React.createClass({

        componentDidMount: function() {
            var props = this.props;

            var s = this._sigmaGraph = new sigma({
                renderers: [
                    {
                        container: ReactDOM.findDOMNode(this),
                        type: 'canvas'
                    }
                ]
            });

            props.nodes.forEach(function(node, idx) {
                s.graph.addNode({
                    id: ''+idx,
                    x: node.x,
                    y: node.y,
                    size: Math.random(),
                    color: 'rgba(190,0,0,0.3)'
                });
            });

            props.edges.forEach(function(edge, idx) {
                s.graph.addEdge({
                    id: ''+idx,
                    source: ''+edge.src,
                    target: ''+edge.dst,
                    color: 'rgba(0,0,0,0.01)'
                });
            });

            s.camera.bind('coordinatesUpdated', function(e) {
                var camera = e.target;
                props.onZoomOrPan(
                    1/camera.ratio,                         // Relative size of viewport
                    props.width/2-camera.x/camera.ratio,    // Panning offset in px relative to top-left corner
                    props.height/2-camera.y/camera.ratio
                );
            });

            console.log('add nodes/edges');
            s.refresh();
            console.log('sigma refresh');
        },

        render: function() {
            return <div style={{width: this.props.width, height: this.props.height}}/>;
        },

        zoom: function(ratio) {
            this._sigmaGraph.camera.goTo({
                ratio: 1/ratio
            });
        },

        pan: function(x, y) {
            this._sigmaGraph.camera.goTo({
                x: this.props.width/2-x,  // consider x,y relative to top-left corner
                y: this.props.height/2-y
            });
        }

    });

    var CytoscapeGraph = React.createClass({

        const: {
            REFRESH_STYLE_FREQ: 400, // ms
            MIN_EDGE_WIDTH: 0.05,
            MAX_EDGE_WIDTH: 0.25,
            NODE_SIZE: 2
        },

        componentDidMount: function() {
            var props = this.props,
                consts = this.const;

            var cs = this._csGraph = cytoscape({
                container: ReactDOM.findDOMNode(this),
                layout: {
                    name: 'preset',
                    fit: false
                },
                minZoom: 1,
                maxZoom: 100,
                autoungrabify: true,
                hideEdgesOnViewport: true,
                hideLabelsOnViewport: true,
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

                            'content': 'data(name)',
                            'font-size': '11px',
                            'font-weight': 'bold',
                            'color': '#337AB7'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'curve-style': 'haystack', // 'bezier', //'haystack',
                            width: .05,
                            opacity: .5,
                            'line-color': 'white', //'lightgrey', //'blue',

                            //'target-arrow-shape': 'triangle',
                            'overlay-color': '#c0c0c0',
                            'overlay-padding': '2px',
                            'overlay-opacity': 40

                        }
                    }
                ],
                elements: {
                    nodes: props.nodes.map(function(node, idx) {
                        return {
                            data: {
                                id: idx
                            },
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
                                target: edge.dst
                            }
                        };
                    })
                }
            })
                .on('zoom', function() {
                    adjustElementSizes();
                    zoomOrPan();
                })
                .on('pan', zoomOrPan);

            console.log('cytoscape add nodes/edges');

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

            var adjustElementSizes = _.debounce(function() {
                var zoom = cs.zoom(),
                    nodeSize = consts.NODE_SIZE/zoom;
                cs.style()
                    .selector('node')
                        .style({
                            width: nodeSize,
                            height: nodeSize
                        })
                    .selector('edge')
                        .style({
                            width: Math.min(consts.MIN_EDGE_WIDTH*zoom, consts.MAX_EDGE_WIDTH)/zoom
                        })
                    .update();
            }, consts.REFRESH_STYLE_FREQ);
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
        }

    });

    return React.createClass({

        getDefaultProps: function() {
            return {
                graphData: graphRandomGenerator(500, 1000),
                width: window.innerWidth,
                height: window.innerHeight,
                margin: 0
            };
        },

        getInitialState: function() {
            return {
                maxCustomerConeSize: Math.max.apply(null, this.props.graphData.ases.map(function(asNode) {
                    return asNode.customerConeSize
                })),
                radialNodes: this._genRadialNodes()
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
        },

        render: function() {
            return <CytoscapeGraph
                ref="radialGraph"
                nodes={this.state.radialNodes}
                edges={this.props.graphData.relationships}
                width={this.props.width}
                height={this.props.height}
                onZoomOrPan={this._onZoomOrPan}
            />;
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
                    x: maxR * radius * Math.cos(node.long /*360 * node.x*/),
                    y: maxR * radius * Math.sin(node.long/*360 * node.x*/)
                };
            })
        },

        _getRadius: function(coneSize, maxConeSize) {
            return coneSize/maxConeSize;
            // 0<=result<=1
            return Math.log(maxConeSize+1) - Math.log(coneSize+1);
        },

        _onZoomOrPan: function(zoom, panX, panY) {
            var r = Math.min(this.props.width, this.props.height)/2,
                offsetX = -(panX-this.props.width/2)/zoom/r,
                offsetY = -(panY-this.props.height/2)/zoom/r,
                offsetR = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
                offsetAng = offsetR?Math.acos(offsetX/offsetR)/Math.PI*180:0,
                zoomRadius = 1/zoom;

            if (offsetY<0) { // Complementary angle
                offsetAng=360-offsetAng;
            }

            this.props.onRadialViewportChange(zoomRadius, offsetR, offsetAng);
        }

    });

});