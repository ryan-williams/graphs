/** @jsx React.DOM */

var Edge = React.createClass({
  render: function() {

  }
});

var Commit = React.createClass({
  render: function() {
    return <rect key={"commit-" + this.props.idx} className="commit" width="10" height="10" x={20 * this.props.idx} y="0" />;
  }
});

var Graph = React.createClass({
  render: function() {
    var commits = {};
    var graph = {};
    this.props.commits.forEach(function(commit) {
      graph[commit.sha] = commit;
    });

    this.props.commits.forEach(function(commit) {
      var parents = [];
      var notFoundParents = [];
      commit.parents.forEach(function(parent) {
        if (parent.sha in graph) {
          parents.push(graph[parent.sha]);
        } else {
          notFoundParents.push(parent);
        }
      });
      commit.parents = parents;
      commit.notFoundParents = notFoundParents;
    });

    var commits = [];
    var commitsBySha = {};
    this.props.commits.forEach(function(commit, idx) {
      //console.log("commit %d: %O", idx, commit);
      var commitObj = <Commit commit={commit} idx={idx} />;
      commits.push(commitObj);
      commitsBySha[commit.sha] = commitObj;
    });

    var edges = [];
    this.props.commits.forEach(function(commit) {
      commit.parents.forEach(function(parent) {
        return <Edge commit={commit} parent={parent} />
      });
    });

    return <svg>
      {commits}
    </svg>;
  }
});

//React.render(
//      <Graph commits={obj} />,
//      document.getElementById('container')
//);


var seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function getParameterByName(name, def) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
  return results === null ? def : decodeURIComponent(results[1].replace(/\+/g, " "));
}


var g = {
  nodes: [],
  edges: []
};

var maxNodeSize = parseInt(getParameterByName('size', '20'));
var sideMargin = getParameterByName('margin', '10').split(',').map(function(n) { return parseInt(n); });
var nodeVerticalSpace = parseInt(getParameterByName('y', '30'));
var images = !!getParameterByName('images');
var ratio = parseFloat(getParameterByName('ratio', '1'));
console.log("ratio: %f, margin: %O, images: %s", ratio, sideMargin, images);

var users = {465045:1, 455755:1};

var commits = {};
obj.forEach(function(commit, idx) {
  var author = commit.author.id;
  //var found = (author in users);
  var found = images;
  //var found = false;
  //var url = found ? '/static/img/' + author + '.jpg' : commit.author.avatar_url;
  var url = commit.author.avatar_url;
  if (!found) {
    console.log("missing author: %d: %s %O", author, commit.author.avatar_url, commit.author);
  }
  commits[commit.sha] = commit;
  g.nodes.push({
    id: commit.sha,
    label: commit.sha.substring(0, 7) + " (" + commit.parents.map(function(parent) { return parent.sha.substring(0, 7); }).join(',') + ")",
    x: random() * 400,
    y: idx * nodeVerticalSpace,
    size: 1,
    type: images ? 'image' : 'def',
    url: url,
    color: '#000'
  });
});

function randomColor() {
  return 'rgb(' + [parseInt(Math.random()*256),parseInt(Math.random()*256),parseInt(Math.random()*256)].join(',') + ')';
}

obj.forEach(function(commit, idx) {
  var color = randomColor();
  commit.parents.forEach(function(parent) {
    if (parent.sha in commits) {
      g.edges.push({
        id: commit.sha + '-' + parent.sha,
        source: commit.sha,
        target: parent.sha,
        size: 1,
        color: color
      });
    }
  });
});

sigma.renderers.def = sigma.renderers.canvas

console.log("graph: %O", g);

var urlSet = {};
var urls = [];
obj.forEach(function(commit) {
  if (!(commit.author.avatar_url in urlSet)) {
    urlSet[commit.author.avatar_url] = 1;
    urls.push(commit.author.avatar_url);
  }
});

var loaded = 0;

// Then, wait for all images to be loaded before instantiating sigma:
urls.forEach(function(url) {
  sigma.canvas.nodes.image.cache(
        url,
        function() {
          console.log("loaded: %d", loaded);
          if (++loaded === urls.length) {
            // Instantiate sigma:
            s = new sigma({
              graph: g,
              settings: {
                nodesPowRatio: ratio,
                edgesPowRatio: ratio,
                maxNodeSize: maxNodeSize,
                sideMargin: sideMargin
              },
              //scale: 'outside',
              //autoRescale: false,
              renderer: {
                // IMPORTANT:
                // This works only with the canvas renderer, so the
                // renderer type set as "canvas" is necessary here.
                container: document.getElementById('sigma-container'),
                type: 'canvas'
              }
            });

            // Initialize the dragNodes plugin:
            var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

            dragListener.bind('startdrag', function (event) {
              console.log(event);
            });
            dragListener.bind('drag', function (event) {
              //console.log(event);
            });
            dragListener.bind('drop', function (event) {
              console.log(event);
            });
            dragListener.bind('dragend', function (event) {
              console.log(event);
            });
          }
        }
  );
});

function gm() { return s.camera.getMatrix(); }
function gt(x,y) { s.camera.goTo({x:x,y:y}); }
function c() { return '(' + [s.camera.x,s.camera.y,s.camera.ratio].join(',') + ')'; }
function n(i) {
  var node = s.graph.nodes()[i];
  return '(' +
        [node.x,node.y,node.size].join(',') +
        ') (' +
        [node['renderer1:x'],node['renderer1:y'],node['renderer1:size']].join(',') +
        ')';
}
