define(['react', 'react-dom', 'jsx!asgraph', 'jsx!polar-layout'], function(React, ReactDOM, AsGraph, PolarLayout) {

    var Controls = React.createClass({
        render: function() {
            return <div style={{
                margin: 10
                //backgroundColor: 'lightgray',
                //padding: 5,
                //borderRadius: 5
            }}>
                {/*Radius: <b>{this.props.radius}</b><br/>
                //Angle: <b>{this.props.angle}</b><br/>
                Zoom R: <b>{this.props.zoomRadius}</b><br/>*/}
                <input type="text"
                    size="20"
                    value={this.props.src}
                    placeholder="Search for AS"
                    onChange={this.props.onSrcChange}
                />
                {/*
                &nbsp;
                Dst node:
                <input type="text"
                    size="6"
                    value={this.props.dst}
                    onChange={this.props.onDstChange}
                />
                */}
            </div>;
        }
    });

    var Logger = React.createClass({
        render: function() {
            var asInfo = this.props.asInfo;
            if (!asInfo) {
                return null;
            }

            return <div style={{
                backgroundColor: 'lightgray',
                margin: 5,
                padding: 5,
                borderRadius: 5
            }}>
                AS: <b>{asInfo.id}</b><br/>
                (<i>{asInfo.orgName} - {asInfo.country}</i>)<br/>
                Customer Cone: <b>{asInfo.customerConeSize}</b> AS
                {asInfo.customerConeSize>1?'es':''}
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
                dstHighlight: null,

                selectedAsInfo: null
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
                        graphData={this.props.data}
                        width={this.state.width}
                        height={this.state.height}
                        margin={this.state.layoutMargin}
                        selectedAs={this.state.srcHighlight}
                        onRadialViewportChange={this._onRadialViewportChange}
                        onAsHover={this._onAsHover}
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
                    position: 'absolute'
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
                <div style={{
                    right: 0,
                    top: this.state.height-70,
                    position: 'absolute'
                }}>
                    <Logger asInfo={this.state.selectedAsInfo}/>
                </div>
            </div>;
        },

        _setSize: function() {
            this.setState({
                width: window.innerWidth,
                height: window.innerHeight - 20
            });
        },

        _onAsHover: function(asInfo) {
            this.setState({selectedAsInfo: asInfo});
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