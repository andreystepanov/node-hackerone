import hackerone, { format } from './'
const {
  reports: { list, get },
} = hackerone

describe('get', () => {
  test('defined', () => {
    expect(get).toBeDefined()
    expect(typeof get).toEqual('function')
  })
})

describe('list', () => {
  test('defined', () => {
    expect(list).toBeDefined()
    expect(typeof list).toEqual('function')
  })

  test.skip('returns all reports disclosed after specific date', async () => {
    const { reports } = await list({
      debug: true,
      limit: -1,
      after: '2020-06-15',
    })

    console.log(reports.length)
  }, 20000)
})

describe('format', () => {
  test('defined', () => {
    expect(format).toBeDefined()
    expect(typeof format).toEqual('function')
  })
})
