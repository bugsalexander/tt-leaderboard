import { Handler, LeaderboardApiPutRequest, UserScore } from './types'

const KV_LEADERBOARD_KEY = 'LEADERBOARD'
const ACCESS_CONTROL_ALLOW_METHODS = 'GET, POST, PUT, OPTIONS';
const HEADERS = {
  'content-type': 'application/json;charset=UTF-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ACCESS_CONTROL_ALLOW_METHODS,
}
const AVG_RATING = 1500
const K_VALUE = 100

export const leaderboardHandler: Handler = async (request, kv) => {
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest(request)
  } else if (request.method === 'GET') {
    return handleGetRequest(request, kv)
  } else if (request.method === 'POST') {
    return handlePostRequest(request, kv)
  } else if (request.method === 'PUT') {
    return handlePutRequest(request, kv)
  }
  return new Response('Expected GET or POST', { status: 405 })
}

// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ACCESS_CONTROL_ALLOW_METHODS,
  'Access-Control-Max-Age': '86400',
}
const handleOptionsRequest = (request: Request) => {
  // Make sure the necessary headers are present for this to be a valid pre-flight request
  const headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    const respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers')!,
    }
    return new Response(null, {
      headers: respHeaders,
    })
  }

  // Handle standard OPTIONS request.
  // If you want to allow other HTTP Methods, you can do that here.
  return new Response(null, {
    headers: {
      Allow: ACCESS_CONTROL_ALLOW_METHODS,
    },
  })
}

const handleGetRequest: Handler = async (_request, kv) => {
  // assume that the result we get back is an object mapping names to elo
  return new Response(
    JSON.stringify({
      leaderboard: sortLeaderboard(parseLeaderboardString(await getLeaderboardData(kv))),
    }),
    {
      headers: HEADERS,
    },
  )
}

const handlePostRequest: Handler = async (request, kv) => {
  const name = await request.json()
  if (typeof name !== 'string') {
    throw `Request body must be of type "string" but instead was "${typeof name}"`
  }

  const leaderboard = await getLeaderboardData(kv)
  if (name in leaderboard) {
    throw `User with name ${name} already exists`
  }
  leaderboard[name] = AVG_RATING
  await updateLeaderboardData(leaderboard, kv)

  return new Response(JSON.stringify(sortLeaderboard(parseLeaderboardString(leaderboard))), {
    status: 201,
    headers: HEADERS,
  })
}

const handlePutRequest: Handler = async (request, kv) => {
  const { winner, loser } = validatePutRequestBody(await request.json())
  const leaderboard = await getLeaderboardData(kv)
  // if either user doesn't exist, abort
  if (!(winner in leaderboard && loser in leaderboard)) {
    throw 'Winner and loser must both already exist in the leaderboard'
  }
  if (winner === loser) {
    throw 'Winner must not be the same as loser'
  }

  const [winnerNewRating, loserNewRating] = calculateRatings(leaderboard[winner], leaderboard[loser], K_VALUE)
  leaderboard[winner] = winnerNewRating
  leaderboard[loser] = loserNewRating

  await updateLeaderboardData(leaderboard, kv)

  return new Response(JSON.stringify(sortLeaderboard(parseLeaderboardString(leaderboard))), {
    status: 202,
    headers: HEADERS,
  })
}

const IDK = 400
export const calculateWinProbability = (ratingPlayerA: number, ratingPlayerB: number): number => {
  const power = (ratingPlayerA - ratingPlayerB) / IDK
  return 1 / (1 + Math.pow(10, power))
}

export const calculateRatingDiff = (probabilityToWin: number, kValue: number, isWin: boolean): number => {
  const score = isWin ? 1 : 0
  return Math.round(kValue * (score - probabilityToWin))
}

export const calculateRatings = (winnerRating: number, loserRating: number, kValue: number) => {
  const probabilityWinnerWins = calculateWinProbability(loserRating, winnerRating)
  const winnerRatingDiff = calculateRatingDiff(probabilityWinnerWins, kValue, true)
  return [winnerRating + winnerRatingDiff, loserRating - winnerRatingDiff]
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
            headers: HEADERS,
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
          headers: HEADERS,
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

export const sortLeaderboard = (leaderboard: UserScore[]): UserScore[] => {
  leaderboard.sort((a, b) => b.elo - a.elo)
  return leaderboard
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
