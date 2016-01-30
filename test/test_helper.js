import jsdom from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';

const doc = jsdom.jsdom('<!doctype html><html><body><i id="app"/></body></html>');
const win = doc.defaultView;

doc.createTreeWalker = function(node) {
  function nextNode() {
    // Not wanting to extensively stub out TreeWalker currently
    return false;
  }

  return {
    currentNode: node,
    nextNode,
  };
}

global.document = doc;
global.window = win;
global.navigator = {
  userAgent: 'node.js',
};

Object.keys(window).forEach(key => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

chai.use(chaiImmutable);
