require.config({
    paths: {
        babel: '//cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.min',
        jsx: '//cdn.rawgit.com/podio/requirejs-react-jsx/v1.0.2/jsx',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',

        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react-with-addons.min',
        'react-dom': '//cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react-dom.min',
        'react-bootstrap': '//cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.28.1/react-bootstrap.min',

        jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        bootstrap: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
        moment: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.0/moment.min',
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.12/d3.min',
        'd3-tip': '//cdnjs.cloudflare.com/ajax/libs/d3-tip/0.6.7/d3-tip.min',

        cytoscape: '//cdnjs.cloudflare.com/ajax/libs/cytoscape/2.5.5/cytoscape.min',
        'cytoscape-panzoom': '//cdnjs.cloudflare.com/ajax/libs/cytoscape-panzoom/2.2.0/cytoscape-panzoom.min',
        'cytoscape-navigator': '//cdn.rawgit.com/cytoscape/cytoscape.js-navigator/1.0.1/cytoscape.js-navigator',
        'cytoscape-qtip': '//cdn.rawgit.com/cytoscape/cytoscape.js-qtip/2.3.0/cytoscape-qtip',

        sigma: '//cdnjs.cloudflare.com/ajax/libs/sigma.js/1.0.3/sigma.min',
        visjs: '//cdnjs.cloudflare.com/ajax/libs/vis/4.12.0/vis.min'
    },
    shim: {
        bootstrap: ['jquery'],
        'cytoscape-panzoom': ['jquery']
    },
    config: {
        babel: {
            fileExtension: ".jsx"
        }
    }
});
