define(['react', 'react-dom', 'triangle-solver', 'locations'], function(React, ReactDOM, solveTriangle, locations) {

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

            return <text
                    x={txtX}
                    y={txtY}
                    fontSize={this.props.length*.6}
                    fontFamily="Sans-serif"
                    fill='lightgrey'
                    textAnchor="middle"
                    transform={'rotate(' + txtRotate + ' ' + txtX + ',' + txtY + ')'}
                    style = {{ 'alignmentBaseline': "central" }}
                >
                    {this.props.text}
                </text>;
        }
    });

    var RadialLabels = React.createClass({

        const: {
            TEXT_HEIGHT_RADIUS_RATIO: 0.025
        },

        propTypes: {
            layoutRadius: React.PropTypes.number.isRequired
        },

        render: function() {

            var props = this.props,
                textHeight = this.const.TEXT_HEIGHT_RADIUS_RATIO*this.props.layoutRadius,
                textHeightInAngles = Math.atan(textHeight/this.props.layoutRadius)*180/Math.PI, // Small-angle approx
                anglesCarry = [],
                opacities = [];

            this.props.labels.forEach(function(label) {
                var closestAngle = anglesCarry.reduce(function(carry, angleCarry) {
                    return Math.min(carry, Math.abs(label.angle-angleCarry));
                }, Infinity);

                anglesCarry.push(label.angle);
                opacities.push(Math.pow(Math.min(1,closestAngle/textHeightInAngles), 6)); // Exponential fade
            });

            return <g>
                {this.props.labels.map(function(label, idx) {

                    // Normalize angle
                    while (label.angle>=180) { label.angle -= 360; }
                    while (label.angle<-180) { label.angle += 360; }

                    var txtX = props.layoutRadius*Math.cos(label.angle*Math.PI/180),
                        txtY = props.layoutRadius*Math.sin(label.angle*Math.PI/180),
                        txtRotate = label.angle + ((Math.abs(label.angle)<90)?0:180);

                    return <text
                        x={txtX}
                        y={txtY}
                        fontSize={textHeight}
                        fontFamily="Sans-serif"
                        fill='lightgrey'
                        textAnchor={Math.abs(label.angle)<90?'start':'end'}
                        transform={'rotate(' + txtRotate + ' ' + txtX + ',' + txtY + ')'}
                        style = {{
                            alignmentBaseline: 'central',
                            fillOpacity: opacities[idx]*.8 }}
                    >
                        {label.text}
                    </text>
                })}
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

        render: function() {
            var rThis = this;

            var radius = Math.min(this.props.width, this.props.height)/2 - this.props.margin;

            return <svg
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

                    {/* Semi-transparent window */}
                    <circle
                        r={radius + 500}
                        stroke={this.props.bckgColor}
                        strokeWidth='1000'
                        strokeOpacity='0.7'
                        fillOpacity='0'
                    />
                    {/* Longitude ring (1/2 margin) */}
                    <circle
                        r={radius + this.props.margin/4}
                        stroke='#3182bd'
                        strokeWidth={this.props.margin/2}
                        strokeOpacity='0.6'
                        fillOpacity='0'
                    />

                    <g>
                        {this._getLongitudeLabels().map(function(label) {
                            return <DirectionMarker
                                length={rThis.props.margin/2}
                                padding={radius}
                                angle={label.angle}
                                text={label.text}
                            />
                        })}
                    </g>
                    <RadialLabels
                        layoutRadius={radius+rThis.props.margin*.65}
                        labels={locations.map(function(city) {
                            return {
                                text: city.text,
                                angle: rThis._getProjectedAngle(city.angle)
                            }
                        })}
                    />
                </g>
            </svg>;
        },

        _getLongitudeLabels: function() {
            var rThis = this,
                longCoords = [0, 45, 90, 135, 180, -45, -90, -135],
                labels = [];

            labels.push.apply(labels, longCoords.map(function(longCoord) {
                    return {
                        text: longCoord + "°",
                        angle: rThis._getProjectedAngle(longCoord)*Math.PI/180
                    };
                })
            );

            return labels;
        },

        _getProjectedAngle: function(angle) {
            if (!this.props.zoomCenter[0]) return -angle; // Right in the center, direct projection

            var knownAngle = this.props.zoomCenter[1] - angle;
            while(knownAngle>180) knownAngle-=360;
            while(knownAngle<-180) knownAngle+=360;

            var neg = knownAngle < 0;
            knownAngle = Math.abs(knownAngle);

            if (knownAngle == 0 || knownAngle==180) return angle; // Zooming in the exact direction of the angle

            // known angle A, side B (full radius=1), side C (zoom radius)
            var res = solveTriangle(null, this.props.zoomCenter[0], 1, knownAngle, null, null);
            return (180 - res[5])*(neg?-1:1) - this.props.zoomCenter[1]; // Use angle C
        }
    });

});
