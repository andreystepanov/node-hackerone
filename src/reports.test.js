import axios from 'axios'
import { getRecentReports, format, getReport } from './reports'

jest.mock('axios')

const reports = [
  {
    node: {
      id: '836045',
      title:
        'Buffer overread in parse_angle_addr called from message_address_parse_path ',
      disclosed_at: '2020-04-02T19:02:07.154Z',
    },
  },
  {
    node: {
      id: '826238',
      title: 'load scripts DOS vulnerability',
      disclosed_at: '2020-04-02T19:19:55.057Z',
    },
  },
  {
    node: {
      id: '798599',
      title: 'xss stored',
      disclosed_at: '2020-04-03T07:27:26.531Z',
    },
  },
  {
    node: {
      id: '806577',
      title:
        'Arbitrary Set-Cookie via "?coupon=" due to semi-colon not encoded',
      disclosed_at: '2020-04-03T09:42:39.066Z',
    },
  },
  {
    node: {
      id: '777984',
      title: 'Denial of Service with Cookie Bomb',
      disclosed_at: '2020-04-03T09:42:56.060Z',
    },
  },
  {
    node: {
      id: '761617',
      title:
        'Information Disclosure FrontPage Configuration Information /_vti_inf.html in https://www.mtn.co.za/',
      disclosed_at: '2020-04-03T11:57:50.369Z',
    },
  },
  {
    node: {
      id: '767066',
      title:
        'Information Disclosure Microsoft IIS Server service.cnf in a mtn website',
      disclosed_at: '2020-04-03T11:58:12.770Z',
    },
  },
  {
    node: {
      id: '837733',
      title: 'Leaking Of Sensitive Information on Github',
      disclosed_at: '2020-04-03T14:03:04.467Z',
    },
  },
  {
    node: {
      id: '836036',
      title: 'Multiple buffer over reads in mbox_from_parse',
      disclosed_at: '2020-04-03T14:43:58.144Z',
    },
  },
  {
    node: {
      id: '267570',
      title: 'Stored XSS through Facebook Page Connection',
      disclosed_at: '2020-04-04T14:56:46.377Z',
    },
  },
]

const response = {
  data: {
    data: {
      reports: {
        edges: reports,
        pageInfo: { endCursor: 'ODA4Nw', hasNextPage: false },
      },
    },
  },
}

// axios.post.mockImplementation(() => Promise.resolve(response))

// axios.get.mockImplementation(() => Promise.resolve({ data: null }))

describe('getRecentReports', () => {
  test('should be defined', () => {
    expect(getRecentReports).toBeDefined()
  })

  test('returns list of recent reports', async () => {
    const recent = await getRecentReports(null, 10)
    expect(recent).toMatchSnapshot()
  })

  test('excludes last synced report (by date)', async () => {
    const report = reports[0].node
    const last = report.disclosed_at
    const recent = await getRecentReports(last, 10)
    expect(recent).not.toEqual(expect.arrayContaining([report]))
  })

  // test.only('returns all recent reports (with pagination)', async () => {
  //   const list = await getRecentReports('1585131039832')

  //   list.map(async report => console.log(report))
  // }, 20000)
})

describe('getReport', () => {
  test('should be defined', () => {
    expect(getReport).toBeDefined()
  })

  test('should return valid report by id', async () => {
    const report = await getReport(reports[0].node.id)
    expect(axios.get).toHaveBeenCalledTimes(1)
  })
})

describe.skip('format', () => {
  test('should be defined', () => {
    expect(format).toBeDefined()
  })

  test.skip('returns formatted report', async () => {
    const lz = require('lz-string')
    const pako = require('pako')
    const raw = await getReport(745324)
    const formatted = format(raw)
    // const yaml = require('js-yaml')
    // const json = JSON.stringify(formatted.data)
    // const buff = new Buffer(json)
    // const compressed = pako.deflate(json)

    // const compressed = lz.compressToBase64(json)

    // console.log(json.length)
    // console.log(compressed.length)
    // console.log(Buffer(compressed).toString('base64').length)
    // console.log(pako.inflate(compressed, { to: 'string' }))

    // console.log(JSON.stringify(formatted.data).length)
    // console.log(yaml.safeDump(formatted.data).length)
    // console.log(formatted.data)
    console.log(formatted.report)

    // expect(formatted).toMatchSnapshot()
  }, 10000)
})
