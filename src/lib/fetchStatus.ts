// Shared mutable object — updated during TrustMrr pagination,
// read by the /api/startups/status endpoint.
export const fetchStatus = {
  active: false,
  page: 0,
  loaded: 0,
  retrying: false,
};
