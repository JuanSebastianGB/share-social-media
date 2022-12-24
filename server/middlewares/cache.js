import expressExpeditiousCache from 'express-expeditious';

const defaultOptions = {
  namespace: 'internalCache',
  defaultTtl: '1 minute',
  statusCodesExpires: {
    200: '1 minute',
    404: '1 minute',
    500: '1 minute',
  },
};

const cacheSystemInit = expressExpeditiousCache(defaultOptions);

export default cacheSystemInit;
