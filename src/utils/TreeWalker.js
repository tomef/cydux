'use strict';

const NODE_TYPE_ELEMENT = 1;

function _getSiblingElement(node) {
  if (node.nextSibling) {
    if (node.nextSibling.nodeType === NODE_TYPE_ELEMENT) {
      return node.nextSibling;
    } else {
      return _getSiblingElement(node.nextSibling);
    }
  } else {
    return false;
  }
}

/**
 * Using a custom 'TreeWalker' since we don't need all of the methods,
 * plus for testing purposes we have to stub it out anyway
 */
export default class TreeWalker {
  constructor(rootNode) {
    this.rootNode = rootNode;
    this.currentNode = rootNode;
  }

  nextNode() {
    if (this.currentNode.firstElementChild) {
      this.currentNode = this.currentNode.firstElementChild;
      return this.currentNode;
    } else {
      this.currentNode = _getSiblingElement(this.currentNode);
      return this.currentNode;
    }
  }
}
