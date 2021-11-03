import { calculateRatings, handler } from '../src/handler'
import makeServiceWorkerEnv = require('service-worker-mock')

declare const global: any

// describe('handle', () => {
//   beforeEach(() => {
//     Object.assign(global, makeServiceWorkerEnv())
//     jest.resetModules()
//   })
//
//   test('handle GET', async () => {
//     const result = await handler(new Request('/', { method: 'GET' }))
//     expect(result.status).toEqual(200)
//     const text = await result.text()
//     expect(text).toEqual('request method: GET')
//   })
//
//   // creating new user that already exist fails
//   // cannot submit matches with yourself
// })

describe('elo', () => {
  const calc = (a: number, b: number) => calculateRatings(a, b, 30);
  // test("even", () => {
  //   expect(calc(1500, 1500, false)).toStrictEqual([1550, 1450]);
  //   expect(calc(1500, 1500, true)).toStrictEqual([1450, 1550]);
  // })

  test('example', () => {
    expect(calc(1200, 1000)).toStrictEqual([1207, 993])
    expect(calc(1207, 993)).toStrictEqual([1214, 986])
    expect(calc(1214, 986)).toStrictEqual([1220, 980])
    // expect(calc(1200, 1000, false)).toBe(993);
  })

  // test("after one match", () => {
  //   expect(calc(1550, 1450, true)).toBe()
  // })
})
