import most from 'most';
import EventEmitter from 'eventemitter3';
import getNodeMap from './get-node-map';

const events = [
  "abort",
  "blur",
  "canplay",
  "canplaythrough",
  "change",
  "click",
  "contextmenu",
  "copy",
  "cut",
  "dblclick",
  "drag",
  "dragend",
  "dragenter",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "durationchange",
  "emptied",
  "ended",
  "error",
  "focus",
  "input",
  "invalid",
  "keydown",
  "keypress",
  "keyup",
  "load",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "mousedown",
  // Intentionally excluded:
  // "mouseenter",
  // "mouseleave",
  // "mousemove",
  // "mouseout",
  // "mouseover",
  "mouseup",
  "paste",
  "pause",
  "play",
  "playing",
  "progress",
  "ratechange",
  "readystatechange",
  "reset",
  "scroll",
  "seeked",
  "seeking",
  "select",
  "show",
  "stalled",
  "submit",
  "suspend",
  "timeupdate",
  "volumechange",
  "waiting",
  "wheel",
];



/**
 * Handles emitted events by adding them to the main event stream
 *
 * @param {object} ev the event object
 * @param {function} add pass the event to this function to add it to the main
 * event stream
 */
function defaultHandleEvent(ev, add) {
  // console.log(`${event}:`, ev); // uncomment to log all events
  if (ev) {
    if (ev.target) {
      const nodeMap = getNodeMap();
      const idObj = nodeMap.get(ev.target);
      if (idObj) {
        const { alias, aid } = idObj;
        ev.cydux = {};
        ev.cydux.alias = alias;
        ev.cydux.aid = aid;
        return add(ev);
      }
    }
  }
}



/**
 * Creates an event stream with the provided event handler and custom events
 *
 * @param {function} handleEvent allows adding events to the returned stream
 * @param {array} [customEvents] any custom events to listen for
 * @return {object} with the created stream and an emitter for custom events
 */
export default function createEventStream({
  handleEvent: handleEvent = defaultHandleEvent,
  customEvents: customEvents = []
} = {}) {
  const emitter = new EventEmitter();
  const eventStream = most.create((add) => {
    events.forEach(event => {
      window.addEventListener(event, eventObj => handleEvent(eventObj, add));
    });
    customEvents.forEach(customEvent => {
      emitter.on(customEvent, eventObj => handleEvent(eventObj, add));
    });
  });

  return {
    eventStream,
    emitter,
  };
}
