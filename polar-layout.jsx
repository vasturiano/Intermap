define(['react', 'react-dom', 'd3', 'triangle-solver'], function(React, ReactDOM, d3, solveTriangle) {

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

            function getProjectedAngle(angle) {
                if (!rThis.props.zoomCenter[0]) return angle; // Right in the center, direct projection

                var knownAngle = angle-rThis.props.zoomCenter[1];
                while(knownAngle>180) knownAngle-=360;
                while(knownAngle<-180) knownAngle+=360;

                var neg = knownAngle < 0;
                knownAngle = Math.abs(knownAngle);

                if (knownAngle == 0 || knownAngle==180) return angle; // Zooming in the exact direction of the angle

                // known angle A, side B (full radius=1), side C (zoom radius)
                var res = solveTriangle(null, rThis.props.zoomCenter[0], 1, knownAngle, null, null);
                return rThis.props.zoomCenter[1] + (180 - res[5])*(neg?-1:1); // Use angle C
            }

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
                    {/*
                    <circle
                        r={radius + this.props.margin/2}
                        stroke='#3182bd'
                        strokeWidth={this.props.margin}
                        strokeOpacity='0.6'
                        fillOpacity='0'
                    />
                    */}
                </g>
            </svg>;
        }
    });

});
