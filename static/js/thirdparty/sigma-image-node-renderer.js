/**
 * This is a basic example on how to develop a custom node renderer. In
 * this example, the renderer will display an image clipped in a disc,
 * with a border colored according the node's "color" value.
 *
 * If a node as the value "image" to its attribute "type", then it will
 * displayed with the node renderer "sigma.canvas.nodes.image", with the
 * url being its "url" value.
 *
 * IMPORTANT: This node renderer just works with the canvas renderer. If
 * you do want to display images with the WebGL renderer, you will have
 * to develop a specific WebGL node renderer.
 */
sigma.utils.pkg('sigma.canvas.nodes');
sigma.canvas.nodes.image = (function() {
  var _cache = {},
        _loading = {},
        _callbacks = {};

  // Return the renderer itself:
  var renderer = function(node, context, settings) {
    var args = arguments,
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          color = node.color || settings('defaultNodeColor'),
          url = node.url;

    if (_cache[url]) {
      context.save();

      // Draw the clipping disc:
      context.beginPath();
      context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
      );
      context.closePath();
      context.clip();

      // Draw the image
      context.drawImage(
            _cache[url],
            node[prefix + 'x'] - size,
            node[prefix + 'y'] - size,
            2 * size,
            2 * size
      );

      // Quit the "clipping mode":
      context.restore();

      // Draw the border:
      context.beginPath();
      context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
      );
      context.lineWidth = size / 5;
      context.strokeStyle = node.color || settings('defaultNodeColor');
      context.stroke();
    } else {
      sigma.canvas.nodes.image.cache(url);
      sigma.canvas.nodes.def.apply(
            sigma.canvas.nodes,
            args
      );
    }
  };

  // Let's add a public method to cache images, to make it possible to
  // preload images before the initial rendering:
  renderer.cache = function(url, callback) {
    if (callback)
      _callbacks[url] = callback;

    if (_loading[url])
      return;

    var img = new Image();

    img.onload = function() {
      _loading[url] = false;
      _cache[url] = img;

      if (_callbacks[url]) {
        _callbacks[url].call(this, img);
        delete _callbacks[url];
      }
    };

    _loading[url] = true;
    img.src = url;
  };

  return renderer;
})();

