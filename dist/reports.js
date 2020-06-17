"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _hackeroneReportFormatter = _interopRequireWildcard(require("hackerone-report-formatter"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const baseUrl = 'https://hackerone.com';

const reports = async ({
  after: lastDate,
  headers = null,
  limit = 25,
  cursor = null,
  order = 'desc',
  debug = false
} = {}) => {
  const last = lastDate ? (0, _hackeroneReportFormatter.formatDate)(lastDate) : null;
  const disclosed_at = last;
  const all = limit < 0;
  const count = all ? 100 : limit;
  const url = `${baseUrl}/graphql`;
  const direction = order.toUpperCase();
  const desc = direction === 'DESC';
  const data = {
    variables: {
      count: count > 100 ? 100 : count,
      ...(disclosed_at && {
        disclosed_at
      }),
      ...(cursor && {
        cursor
      })
    },
    query: `query GetReports($disclosed_at: DateTime, $count: Int${cursor ? ', $cursor: String' : ''}) { reports( ${cursor ? 'after: $cursor,' : ''} first: $count, order_by:{ field: disclosed_at, direction: ${direction}}, where:{ disclosed_at: { _gt: $disclosed_at } } ) { edges { node { id: _id title disclosed_at } } pageInfo { endCursor hasNextPage } } }`
  };
  const config = {
    headers: {
      'User-Agent': 'node-hackerone/0.1',
      ...headers,
      'x-auth-token': '----'
    }
  };
  const debugInfo = {
    options: {
      limit,
      order,
      after: last,
      cursor
    },
    request: {
      config,
      data
    }
  };
  const {
    list,
    error,
    has_more,
    cursor: after
  } = await _axios.default.post(url, data, config).then(({
    data: response
  }) => {
    const {
      data: {
        reports: {
          edges: reports,
          pageInfo
        }
      }
    } = response; // .sort((a, b) =>
    //   a.node.disclosed_at < b.node.disclosed_at
    //     ? -1
    //     : a.node.disclosed_at > b.node.disclosed_at
    //     ? 1
    //     : 0,
    // )

    const items = reports.map(({
      node
    }) => ({ ...node,
      id: Number(node.id)
    })).filter(report => {
      if (!last) {
        return true;
      }

      return report.disclosed_at !== last;
    });
    return {
      list: items,
      has_more: pageInfo.hasNextPage || false,
      cursor: pageInfo.endCursor || null
    };
  }).catch(({
    data
  }) => ({
    list: [],
    has_more: false,
    cursor: null,
    error: true,
    details: data,
    ...(debug && {
      debug_information: debugInfo
    })
  }));

  if (!error && all && has_more && after) {
    const {
      list: rest
    } = await getRecent({
      last,
      limit,
      cursor: after
    });
    return {
      reports: [...list, ...rest],
      has_more: false,
      cursor: null,
      ...(debug && {
        debug_information: debugInfo
      })
    };
  }

  return {
    reports: list,
    has_more,
    cursor: has_more ? after : null,
    ...(debug && {
      debug_information: debugInfo
    })
  };
};

const report = async (id, simple = false) => {
  return id ? await _axios.default.get(`${baseUrl}/reports/${Number(id)}.json`).then(({
    data
  }) => simple ? (0, _hackeroneReportFormatter.default)(data) : data).catch(({
    status
  }) => null) : null;
};

var _default = {
  list: reports,
  get: report,
  format: _hackeroneReportFormatter.default
};
exports.default = _default;