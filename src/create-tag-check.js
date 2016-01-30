/**
 * Creates a function to check for events within a tagged descendant element
 * of an aliased element
 *
 * @param {string} topAlias the alias of the top element
 * @return {function} to be used to check for events in tagged descendants
 */
export default function createTagCheck(topAlias) {
  return function checkIsTagged(tag) {
    return (event) => {
      const { target:node } = event;
      if (node) {
        if (node.getAttribute('data-tag') === tag) {
          return true;
        } else if (node.getAttribute('data-cydux-alias') !== topAlias) {
          return _checkParentTag(node, tag, topAlias);
        }
      }
      return false;
    }
  }
}


function _checkParentTag(node, tag, topAlias) {
  if (node.parentNode && node.parentNode.getAttribute) {
    const dataTag = node.parentNode.getAttribute('data-tag');
    if (dataTag) {
      // If 'data-tag' is present but not equal to the one we're looking for,
      // then we're in a different tag than the one we want:
      // - either a tagged child of the tagged element we're looking for
      // - or as a sibling to the tagged element we're looking for
      return dataTag === tag;
    } else if (node.parentNode.getAttribute('data-cydux-alias') === topAlias) {
      return false;
    } else {
      return _checkParentTag(node.parentNode, tag, topAlias);
    }
  } else {
    return false;
  }
}
