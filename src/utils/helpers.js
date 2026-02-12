// export const generateRandomString = (size, mode = '111') => {
//   // '100': [0-9]
//   // '010': [A-B]
//   // '101': [0-9] + [a-b]
//   // '110': [0-9] + [A-B]
//   // '111': [0-9] + [A-B] + [a-b]
//   const r = (n) => Math.floor(Math.random() * n)
//   const m = [...mode]
//     .map((v, i) => parseInt(v, 10) * (i + 1))
//     .filter(Boolean)
//     .map((v) => v - 1)
//   return [...new Array(size)].reduce(
//     (a) =>
//       a +
//       String.fromCharCode(
//         [48 + r(10), 65 + r(26), 97 + r(26)][m[r(m.length)]]
//       ),
//     ''
//   )
// }

// export const generateRandomStringWithTimestamp = (size, mode = '111') => {
//   // '100': [0-9]
//   // '010': [A-B]
//   // '101': [0-9] + [a-b]
//   // '111': [0-9] + [A-B] + [a-b]
//   const r = (n) => Math.floor(Math.random() * n)
//   const m = [...mode]
//     .map((v, i) => parseInt(v, 10) * (i + 1))
//     .filter(Boolean)
//     .map((v) => v - 1)

//   const timestamp = new Date().getTime().toString()

//   const timestampLength = timestamp.length

//   const randomStringLength = size - timestampLength

//   const randomString = [...new Array(randomStringLength)].reduce(
//     (a) =>
//       a +
//       String.fromCharCode(
//         [48 + r(10), 65 + r(26), 97 + r(26)][m[r(m.length)]]
//       ),
//     ''
//   )

//   const combinedString = timestamp + randomString

//   return combinedString
// }

export const response = (result) => {
  if (result.error) {
    return {
      status: 'error',
      message: result.error,
      data: null
    }
  } else {
    return {
      status: 'success',
      message: result.message ?? null,
      data: result.data ?? null,
      meta: result.meta ?? undefined
    }
  }
}

export const formatDecimal = (number, decimal = 2) => {
  let num = parseFloat(number).toFixed(decimal)
  num = parseFloat(num)
  return num
}

export const delay = (ms) => {
// MILISECOND DELAY
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
