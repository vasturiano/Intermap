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
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.12/d3.min',

        cytoscape: '//cdnjs.cloudflare.com/ajax/libs/cytoscape/2.5.5/cytoscape.min',
        'cytoscape-panzoom': '//cdnjs.cloudflare.com/ajax/libs/cytoscape-panzoom/2.2.0/cytoscape-panzoom.min'
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
