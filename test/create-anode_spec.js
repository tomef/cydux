import { expect } from 'chai';
import createAnode from '../src/create-anode';
import React from 'react';
import {
  renderIntoDocument,
  isCompositeComponent,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithTag,
} from 'react-addons-test-utils';

describe('createAnode', () => {
  it('creates a React component class', () => {
    const Anode = createAnode();
    const anodeComponent = renderIntoDocument(<Anode />);
    expect(isCompositeComponent(anodeComponent)).to.equal(true);
  });

  it('renders a <div> by default', () => {
    const Anode = createAnode();
    const anodeComponent = renderIntoDocument(<Anode />);
    const divs = scryRenderedDOMComponentsWithTag(anodeComponent, 'div');
    expect(divs.length).to.equal(1);
  });

  it('renders other tags as specified using the "tagName" prop', () => {
    const Anode = createAnode();
    const anodeComponent = renderIntoDocument(<Anode tagName="span" />);
    const spans = scryRenderedDOMComponentsWithTag(anodeComponent, 'span');
    expect(spans.length).to.equal(1);

    const anodeComponent2 = renderIntoDocument(<Anode tagName="li" />);
    const lis = scryRenderedDOMComponentsWithTag(anodeComponent2, 'li');
    expect(lis.length).to.equal(1);
  });

  it('adds "data-cydux-*" attributes from provided props', () => {
    const Anode = createAnode();
    const anodeComponent = renderIntoDocument(<Anode alias="beans" aid="123" />);
    const element = findRenderedDOMComponentWithTag(anodeComponent, 'div');
    expect(element.getAttribute('data-cydux-alias')).to.equal('beans');
    expect(element.getAttribute('data-cydux-aid')).to.equal('123');
  });

  it('passes children through', () => {
    const Anode = createAnode();
    const anodeComponent = renderIntoDocument(
      <Anode>
        <span>I get passed through</span>
        <p>Well aren't you special</p>
      </Anode>
    );
    const span = findRenderedDOMComponentWithTag(anodeComponent, 'span');
    expect(span.textContent).to.equal('I get passed through');
    const para = findRenderedDOMComponentWithTag(anodeComponent, 'p');
    expect(para.textContent).to.equal("Well aren't you special");
  });
});
