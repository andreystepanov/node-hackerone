import axios from 'axios'
import format, { formatDate } from 'hackerone-report-formatter'

const baseUrl = 'https://hackerone.com'

const reports = async ({
  after: lastDate,
  headers = null,
  limit = 25,
  cursor = null,
  order = 'desc',
  debug = false,
} = {}) => {
  const last = lastDate ? formatDate(lastDate) : null
  const disclosed_at = last
  const all = limit < 0
  const count = all ? 100 : limit

  const url = `${baseUrl}/graphql`
  const direction = order.toUpperCase()
  const desc = direction === 'DESC'
  const data = {
    variables: {
      count: count > 100 ? 100 : count,
      ...(disclosed_at && {
        disclosed_at,
      }),
      ...(cursor && {
        cursor,
      }),
    },
    query: `query GetReports($disclosed_at: DateTime, $count: Int${
      cursor ? ', $cursor: String' : ''
    }) { reports( ${
      cursor ? 'after: $cursor,' : ''
    } first: $count, order_by:{ field: disclosed_at, direction: ${direction}}, where:{ disclosed_at: { _gt: $disclosed_at } } ) { edges { node { id: _id title disclosed_at } } pageInfo { endCursor hasNextPage } } }`,
  }
  const config = {
    headers: {
      'User-Agent': 'node-hackerone/0.1',
      ...headers,
      'x-auth-token': '----',
    },
  }

  const debugInfo = {
    options: {
      limit,
      order,
      after: last,
      cursor,
    },
    request: {
      config,
      data,
    },
  }

  const { list, error, has_more, cursor: after } = await axios
    .post(url, data, config)
    .then(({ data: response }) => {
      const {
        data: {
          reports: { edges: reports, pageInfo },
        },
      } = response

      // .sort((a, b) =>
      //   a.node.disclosed_at < b.node.disclosed_at
      //     ? -1
      //     : a.node.disclosed_at > b.node.disclosed_at
      //     ? 1
      //     : 0,
      // )

      const items = reports
        .map(({ node }) => ({
          ...node,
          id: Number(node.id),
        }))
        .filter(report => {
          if (!last) {
            return true
          }

          return report.disclosed_at !== last
        })

      return {
        list: items,
        has_more: pageInfo.hasNextPage || false,
        cursor: pageInfo.endCursor || null,
      }
    })
    .catch(({ data }) => ({
      list: [],
      has_more: false,
      cursor: null,
      error: true,
      details: data,
      ...(debug && { debug_information: debugInfo }),
    }))

  if (!error && all && has_more && after) {
    const { list: rest } = await reports({ last, limit, cursor: after })

    return {
      reports: [...list, ...rest],
      has_more: false,
      cursor: null,
      ...(debug && { debug_information: debugInfo }),
    }
  }

  return {
    reports: list,
    has_more,
    cursor: has_more ? after : null,
    ...(debug && { debug_information: debugInfo }),
  }
}

const report = async (id, simple = false) => {
  return id
    ? await axios
        .get(`${baseUrl}/reports/${Number(id)}.json`)
        .then(({ data }) => (simple ? format(data) : data))
        .catch(({ status }) => null)
    : null
}

export default {
  list: reports,
  get: report,
  format,
}
