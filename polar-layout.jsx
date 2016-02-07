define(['react', 'react-dom', 'd3', 'triangle-solver', 'locations'], function(React, ReactDOM, d3, solveTriangle, locations) {

    var DirectionMarker = React.createClass({
        propTypes: {
            length: React.PropTypes.number.isRequired,
            padding: React.PropTypes.number,
            angle: React.PropTypes.number.isRequired,
            text: React.PropTypes.string
        },

        getDefaultProps: function() {
            return {
                padding: 0,
                text: ''
            }
        },

        render: function() {

            var txtX = (this.props.padding+this.props.length/2)*Math.cos(this.props.angle),
                txtY = (this.props.padding+this.props.length/2)*Math.sin(this.props.angle),
                txtRotate = this.props.angle*180/Math.PI;

            while (txtRotate>=180) { txtRotate -= 360; }
            while (txtRotate<-180) { txtRotate += 360; }
            txtRotate += ((txtRotate>0)?-90:90);

            return <g>
                <linee
                    x1={this.props.padding*Math.cos(this.props.angle)}
                    y1={this.props.padding*Math.sin(this.props.angle)}
                    x2={(this.props.padding+this.props.length)*Math.cos(this.props.angle)}
                    y2={(this.props.padding+this.props.length)*Math.sin(this.props.angle)}
                    stroke='grey'
                    />
                <text
                    x={txtX}
                    y={txtY}
                    fontSize={this.props.length*.6}
                    fontFamily="Sans-serif"
                    fill='lightgrey'
                    textAnchor="middle"
                    transform={'rotate(' + txtRotate + ' ' + txtX + ',' + txtY + ')'}
                    style = {{ 'alignmentBaseline': "central" }}
                    >{this.props.text}</text>
            </g>;
        }
    });

    var GraticuleGrid = React.createClass({

        render: function() {
            var props = this.props;
            return <g>
                {Array.apply(null, {length: props.nRadialLines}).map(function(_, idx) {
                    var angle = idx*360/props.nRadialLines*Math.PI/180;
                    return <line
                        x1={0}
                        y1={0}
                        x2={props.radius*Math.cos(angle)}
                        y2={props.radius*Math.sin(angle)}
                        stroke = 'lightgrey'
                        strokeWidth = '1'
                        style = {{fillOpacity: 0, vectorEffect: 'non-scaling-stroke'}}
                        />
                })}
                {Array.apply(null, {length: props.nConcentricLines}).map(function(_, idx) {
                    return <circle
                        r = {props.radius*(idx+1)/(props.nConcentricLines+1)}
                        stroke = 'lightgrey'
                        strokeWidth = '1'
                        style = {{fillOpacity: 0, vectorEffect: 'non-scaling-stroke'}}
                    />
                })}
            </g>;
        }

    });

    return React.createClass({

        propTypes: {
            radius: React.PropTypes.number.isRequired,
            margin: React.PropTypes.number.isRequired,
            zoomCenter: React.PropTypes.arrayOf(React.PropTypes.number),
            zoomRadius: React.PropTypes.number
        },

        getDefaultProps: function() {
            return {
                zoomCenter: [0,0], // radial, angle
                zoomRadius: 1,
                bckgColor: 'white'
            };
        },

        getInitialState: function() {
            return {
                cardinalPoints: {
                    S: 90,
                    SE: 45,
                    E: 0,
                    NE: -45,
                    N: -90,
                    NW: -135,
                    W: 180,
                    SW: 135
                }
            }
        },

        componentDidMount: function() {
            /*var canvas = d3.select(ReactDOM.findDOMNode(this));

             canvas.append('circle')
             .attr('r', this.props.radius)
             .style({
             fill: 'blue'
             });
             */
        },

        render: function() {
            var rThis = this;

            var radius = Math.min(this.props.width, this.props.height)/2 - this.props.margin;

            return  <svg
                width={this.props.width}
                height={this.props.height}
                style={{margin: 'auto', display: 'block'}}
                >
                <g
                    transform={'translate('
                        + (this.props.width/2) + ','
                        + (this.props.height/2) + ')'
                    }
                    >
                    <circlee
                        r={radius}
                        fill='#FAFAFA'
                        />
                    <g
                        transform = {
                            'scale(' + (1/rThis.props.zoomRadius) + ')'
                            + ' translate('
                            + (-radius * rThis.props.zoomCenter[0]*Math.cos(-rThis.props.zoomCenter[1]*Math.PI/180)) + ','
                            + (-radius * rThis.props.zoomCenter[0]*Math.sin(-rThis.props.zoomCenter[1]*Math.PI/180)) + ')'
                    }>
                        <GraticuleGrid
                            nConcentricLines={Math.max(2, Math.pow(2, Math.round(Math.log(6/this.props.zoomRadius))))-1}
                            nRadialLines={Math.max(4, Math.pow(2, Math.round(Math.log(6/this.props.zoomRadius))))}
                            radius={radius}
                            />
                    </g>
                    <circle
                        r={radius + 500}
                        stroke={this.props.bckgColor}
                        strokeWidth='1000'
                        strokeOpacity='0.7'
                        fillOpacity='0'
                    />
                    <circle
                        r={radius + this.props.margin/2}
                        stroke='#3182bd'
                        strokeWidth={this.props.margin}
                        strokeOpacity='0.6'
                        fillOpacity='0'
                    />

                    <g>
                        {this._getRadialLabels().map(function(label) {
                            return <DirectionMarker
                                length={rThis.props.margin}
                                padding={radius}
                                angle={label.angle}
                                text={label.text}
                            />
                        })}
                    </g>
                </g>
            </svg>;
        },

        _getRadialLabels: function() {

            var rThis = this;

            var longCoords = [0, 45, 90, 135, 180, -45, -90, -135];

            function getProjectedAngle(angle) {
                if (!rThis.props.zoomCenter[0]) return -angle; // Right in the center, direct projection

                var knownAngle = rThis.props.zoomCenter[1] - angle;
                while(knownAngle>180) knownAngle-=360;
                while(knownAngle<-180) knownAngle+=360;

                var neg = knownAngle < 0;
                knownAngle = Math.abs(knownAngle);

                if (knownAngle == 0 || knownAngle==180) return angle; // Zooming in the exact direction of the angle

                // known angle A, side B (full radius=1), side C (zoom radius)
                var res = solveTriangle(null, rThis.props.zoomCenter[0], 1, knownAngle, null, null);
                return (180 - res[5])*(neg?-1:1) - rThis.props.zoomCenter[1]; // Use angle C
            }

            function filterLabels(labels, charRatio) {

            }

            var labels = [];

            /*
            var cardinalPoints = {
                S: -90,
                SE: -45,
                E: 0,
                NE: 45,
                N: 90,
                NW: 135,
                W: 180,
                SW: -135
            };
            labels.push.apply(labels, Object.keys(cardinalPoints).map(
                function(cardPnt) {
                    return {
                        text: cardPnt,
                        angle: getProjectedAngle(cardinalPoints[cardPnt])*Math.PI/180
                    };
                })
            );
            */

            labels.push.apply(labels, locations.map(
                function(loc) {
                    return {
                        text: loc.text,
                        angle: getProjectedAngle(loc.angle)*Math.PI/180
                    };
                })
            );


            labels.push.apply(labels, longCoords.map(function(longCoord) {
                    return {
                        text: longCoord + "°",
                        angle: getProjectedAngle(longCoord)*Math.PI/180
                    };
                })
            );


            return labels;
        }
    });

});
