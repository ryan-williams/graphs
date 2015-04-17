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
      console.log("commit %d: %O", idx, commit);
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

var g = {
  nodes: [],
  edges: []
};

var commits = {};
obj.forEach(function(commit, idx) {
  commits[commit.sha] = commit;
  g.nodes.push({
    id: commit.sha,
    label: commit.sha.substring(0, 7) + " (" + commit.parents.map(function(parent) { return parent.sha.substring(0, 7); }).join(',') + ")",
    x: Math.random() * 200,
    y: idx * 30,
    size: 10,
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

// Instantiate sigma:
s = new sigma({
  graph: g,
  container: 'sigma-container'
});

React.render(
      <Graph commits={obj} />,
      document.getElementById('container')
);
