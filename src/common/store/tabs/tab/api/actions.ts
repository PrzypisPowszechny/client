// tslint:disable:max-line-length
/*
 * Alias actions to transmit the action to the background page -- a side effect of webext-redux
 * https://github.com/tshaddix/webext-redux#4-optional-implement-actions-whose-logic-only-happens-in-the-background-script-we-call-them-aliases
 */

// tslint:enable:max-line-length

export function createResource(...args) {
  return { type: 'createResource', args };
}

export function readEndpoint(...args) {
  return { type: 'readEndpoint', args };
}

export function readEndpointWithCustomOptions(...args) {
  return { type: 'readEndpointWithCustomOptions', args };
}

export function updateResource(...args) {
  return { type: 'updateResource', args };
}

export function deleteResource(...args) {
  return { type: 'deleteResource', args };
}

export function requireResource(...args) {
  return { type: 'requireResource', args };
}

// auxiliary action creators
export function readEndpointWithHeaders(endpoint, headers) {
  const requestOptions = {
    headers,
  };
  return readEndpointWithCustomOptions(endpoint, { requestOptions });
}
