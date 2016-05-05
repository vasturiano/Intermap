define(['react', 'react-dom', 'jsx!asgraph', 'jsx!polar-layout'], function(React, ReactDOM, AsGraph, PolarLayout, _) {

    var Controls = React.createClass({
        render: function() {
            return null;
            return <div style={{
                margin: 10
            }}>
                this.props.search
                <input type="text"
                    size="20"
                    value={this.props.search}
                    placeholder="Search for an AS"
                    onChange={this._handleSearchUpdate}
                />
            </div>;
        },

        _handleSearchUpdate: function(event) {
            this.props.onSearchChange(event.target.value);
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
                <div style={{ 'text-overflow':'ellipsis','width':'300'}}>
                    (<i>{asInfo.orgName} - {asInfo.country}</i>)</div>
                Customer Cone: <b>{asInfo.customerConeSize}</b> AS
                {asInfo.customerConeSize>1?'es':''}<br/>
                Rank: <b>{asInfo.rank}</b><br/>
                    <table border="1" style={{
                        'font-size':'50%', 'text-align':'center'
                        }}><tr>
                        <td rowSpan="2" style={{
                            'font-size':'200%', 'v-align':'center'
                            }}> Degree: </td>
                         <td><b> {asInfo.degreeProvider}</b></td>
                         <td><b> {asInfo.degreePeer}</b></td>
                         <td><b> {asInfo.degreeCustomer}</b></td>
                    </tr><tr>
                         <td>provider</td>
                         <td>peer</td>
                         <td>customer</td>
                    </tr></table>
            </div>;
        }
    });

    return React.createClass({

        getInitialState: function() {
            return {
                width: null, //window.innerWidth,
                height: null, //window.innerHeight - 20,
                layoutMargin: 30,

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
                        onAsClick={this._onAsClick}
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
                        search={this.state.srcHighlight}
                        onSearchChange={this._onSrcChange}
                    />
                </div>
                <div style={{
                    left: 0,
                    top: this.state.height-120,
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

        _onAsClick: function(asInfo) {
            this.setState({srcHighlight: asInfo.id});
        },

        _onSrcChange: function(src) {
            this.setState({srcHighlight: src});
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
