import { calculateRatings, handler, sortLeaderboard } from '../src/handler'
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

  test('example', () => {
    expect(calc(1200, 1000)).toStrictEqual([1207, 993])
    expect(calc(1207, 993)).toStrictEqual([1214, 986])
    expect(calc(1214, 986)).toStrictEqual([1220, 980])
  })
})

const u = (name: string, elo :number) => ({ name, elo});

describe("sort leaderboard", () => {
  const brian = u("brian", 10)
  const andrew = u("andrew", 12);
  const alex = u("alex", 11);
  const l1 = [brian, andrew, alex];
  const l2 = [andrew, alex, brian];

  test("sorts properly", () => {
    expect(sortLeaderboard(l1)).toStrictEqual(l2);
  })
});