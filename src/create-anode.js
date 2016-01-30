import getNodeMap from './get-node-map';
import React from 'react';
import ReactDOM from 'react-dom';

export default function createAnode(mixins) {
  const Anode = React.createClass({
    mixins: [mixins],

    contextTypes: {
      alias: React.PropTypes.string,
      aid: React.PropTypes.string,
    },

    childContextTypes: {
      alias: React.PropTypes.string,
      aid: React.PropTypes.string,
    },

    getChildContext: function() {
      return {
        alias: this.props.alias,
        aid: this.props.aid,
      };
    },

    propTypes: {
      aid: React.PropTypes.string,
      alias: React.PropTypes.string,
      tag: React.PropTypes.string,
      tagName: React.PropTypes.string,
      children: React.PropTypes.any,
    },

    getDefaultProps: function() {
      return {
        tagName: 'div',
      };
    },

    walkTree: function() {
      const alias = this.props.alias || this.context.alias;
      if (alias) {
        const aid = this.props.aid || this.context.aid;
        const aidObj = { alias, aid };
        const nodeMap = getNodeMap();
        const node = ReactDOM.findDOMNode(this);
        const treeWalker = document.createTreeWalker(node);
        if (nodeMap.get(treeWalker.currentNode) === undefined) {
          nodeMap.set(treeWalker.currentNode, aidObj);
        }
        while (treeWalker.nextNode()) {
          if (nodeMap.get(treeWalker.currentNode) === undefined) {
            nodeMap.set(treeWalker.currentNode, aidObj);
          }
        }
      }
    },

    componentDidMount: function() {
      this.walkTree();
    },

    componentDidUpdate: function() {
      this.walkTree();
    },

    render: function() {
      const {
        alias,
        aid,
        tag,
        tagName,
        children,
        ...rest
      } = this.props;
      return React.createElement(
        tagName,
        {
          'data-cydux-alias': alias,
          'data-cydux-aid': aid,
          'data-tag': tag,
          ...rest
        },
        children
      );
    },
  });

  return Anode;
}
