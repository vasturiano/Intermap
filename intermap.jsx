define(['react', 'react-dom', 'jsx!asgraph', 'jsx!polar-layout'], function(React, ReactDOM, AsGraph, PolarLayout) {

    var Controls = React.createClass({
        render: function() {
            return <div>
                Radius: <b>{this.props.radius}</b><br/>
                Angle: <b>{this.props.angle}</b><br/>
                Zoom R: <b>{this.props.zoomRadius}</b><br/>
                Src node:
                <input type="text"
                    size="6"
                    value={this.props.src}
                    onChange={this.props.onSrcChange}
                />
                &nbsp;
                Dst node:
                <input type="text"
                    size="6"
                    value={this.props.dst}
                    onChange={this.props.onDstChange}
                />
            </div>;
        }
    });

    return React.createClass({

        getInitialState: function() {
            return {
                width: null, //window.innerWidth,
                height: null, //window.innerHeight - 20,
                layoutMargin: 15,

                offsetAngle: 0,
                offsetRadius: 0,
                zoomRadius: 1,

                srcHighlight: null,
                dstHighlight: null
            }
        },

        componentWillMount: function() {
            this._setSize();
            window.addEventListener('resize', this._setSize);
        },

        componentWillUnmount: function() {
            window.removeEventListener('resize', this._setSize);
        },

        render: function() {
            return <div style={{position: 'relative'}}>
                <div style={{ position: 'absolute' }}>
                    <AsGraph
                        graphDataa={this.props.data}
                        width={this.state.width}
                        height={this.state.height}
                        margin={this.state.layoutMargin}
                        onRadialViewportChange={this._onRadialViewportChange}
                    />
                </div>

                <div style={{
                    position: 'absolute',
                    pointerEvents: 'none'
                }}>
                    <PolarLayout
                        width={this.state.width}
                        height={this.state.height}
                        margin={this.state.layoutMargin}
                        bckgColor="#001"
                        zoomCenter={[this.state.offsetRadius, this.state.offsetAngle]}
                        zoomRadius={this.state.zoomRadius}
                    />
                </div>
                <div style={{
                    right: 0,
                    position: 'absolute',
                    backgroundColor: 'lightgray',
                    padding: 5,
                    borderRadius: 5
                }}>
                    <Controls
                        radius={this.state.offsetRadius}
                        angle={this.state.offsetAngle}
                        zoomRadius={this.state.zoomRadius}
                        src={this.state.srcHighlight}
                        dst={this.state.dstHighlight}
                        onSrcChange={this._onSrcChange}
                        onDstChange={this._onDstChange}
                    />
                </div>
            </div>;
        },

        _setSize: function() {
            this.setState({
                width: window.innerWidth,
                height: window.innerHeight - 20
            });
        },

        _onSrcChange: function(event) {
            this.setState({srcHighlight: event.target.value});
        },

        _onDstChange: function(event) {
            this.setState({dstHighlight: event.target.value});
        },

        _onRadialViewportChange: function(zoom, offsetR, offsetAngle) {
            this.setState({
                offsetRadius: offsetR,
                offsetAngle: offsetAngle,
                zoomRadius: zoom
            });

        }

    });

});