import { Handler, LeaderboardApiPutRequest, UserScore } from './types'

const KV_LEADERBOARD_KEY = 'LEADERBOARD'
const JSON_HEADERS = { 'content-type': 'application/json;charset=UTF-8' }
const IS_WIN = true
const AVG_RATING = 1500

export const leaderboardHandler: Handler = async (request, kv) => {
  if (request.method === 'GET') {
    return handleGetRequest(request, kv)
  } else if (request.method === 'POST') {
    return handlePostRequest(request, kv)
  } else if (request.method === 'PUT') {
    return handlePutRequest(request, kv)
  }
  return new Response('Expected GET or POST', { status: 405 })
}

const handleGetRequest: Handler = async (_request, kv) => {
  // assume that the result we get back is an object mapping names to elo
  return new Response(
    JSON.stringify({
      leaderboard: parseLeaderboardString(await getLeaderboardData(kv)),
    }),
    {
      headers: JSON_HEADERS,
    },
  )
}

const handlePostRequest: Handler = async (request, kv) => {
  const name = request.body as unknown;
  if (typeof name !== 'string') {
    throw 'Request body must be of type "string"'
  }

  const leaderboard = await getLeaderboardData(kv)
  leaderboard[name] = AVG_RATING
  await updateLeaderboardData(leaderboard, kv)

  return new Response(JSON.stringify(leaderboard), {
    status: 201,
    headers: JSON_HEADERS,
  })
}

const handlePutRequest: Handler = async (request, kv) => {
  const { winner, loser } = validatePutRequestBody(request.body)
  const leaderboard = await getLeaderboardData(kv)
  // if either user doesn't exist, abort
  if (!(winner in leaderboard && loser in leaderboard)) {
    throw 'Winner and loser must both already exist in the leaderboard'
  }
  if (winner === loser) {
    throw 'Winner must not be the same as loser'
  }

  const winnerOldRating = leaderboard[winner]
  const loserOldRating = leaderboard[loser]
  const expectedScore = calculateExpectedScore(winnerOldRating, loserOldRating)
  const winnerNewRating = calculateNewRating(
    winnerOldRating,
    expectedScore,
    IS_WIN,
  )
  const loserNewRating = calculateNewRating(
    loserOldRating,
    expectedScore,
    !IS_WIN,
  )
  leaderboard[winner] = winnerNewRating
  leaderboard[loser] = loserNewRating

  await updateLeaderboardData(leaderboard, kv)

  return new Response(JSON.stringify(parseLeaderboardString(leaderboard)), {
    status: 202,
    headers: JSON_HEADERS,
  })
}

const K_VALUE = 100
const calculateExpectedScore = (
  ratingPlayerA: number,
  ratingPlayerB: number,
): number => {
  const power = Math.abs(ratingPlayerA - ratingPlayerB) / K_VALUE
  return 1 / (1 + Math.pow(10, power))
}

const calculateNewRating = (
  rating: number,
  expectedScore: number,
  isWin: boolean,
): number => {
  const score = isWin ? 1 : 0
  return rating + K_VALUE * (score - expectedScore)
}

export const safe =
  (handler: Handler): Handler =>
  async (req, kv) => {
    try {
      return await handler(req, kv)
    } catch (e) {
      if (e instanceof Error) {
        return new Response(
          JSON.stringify({
            name: e.name,
            message: e.message,
            stackTrace: e.stack,
          }),
          {
            status: 500,
            headers: JSON_HEADERS,
          },
        )
      } else if (typeof e === 'string') {
        return new Response(`Bad Request: ${e}`, { status: 400 })
      }
      return new Response(
        JSON.stringify({
          name: 'Unknown value thrown in handler',
          value: e,
        }),
        {
          status: 500,
          headers: JSON_HEADERS,
        },
      )
    }
  }

const getLeaderboardData = async (kv: KVNamespace): Promise<Record<string, number>> => {
  const leaderboardString = await kv.get(KV_LEADERBOARD_KEY)
  if (leaderboardString === null) {
    return {}
  }
  return JSON.parse(leaderboardString)
}

const updateLeaderboardData = async (data: Record<string, number>, kv: KVNamespace) => {
  await kv.put(KV_LEADERBOARD_KEY, JSON.stringify(data))
  return
}

const parseLeaderboardString = (data: Record<string, number>): UserScore[] => {
  return Object.entries(data).map(([name, elo]) => ({
    name,
    elo,
  }))
}

export const validatePutRequestBody = (body: any): LeaderboardApiPutRequest => {
  if (typeof body !== 'object' || !body) {
    throw 'Request body must be an object'
  }
  if (!('winner' in body && 'loser' in body)) {
    throw 'Request body must contain properties "loser" and "winner"'
  }
  if (!(typeof body.winner === 'string' && typeof body.loser === 'string')) {
    throw 'Request body properties "loser" and "winner" must have string values'
  }
  return {
    winner: body.winner,
    loser: body.loser,
  }
}

export const handler = safe(leaderboardHandler)