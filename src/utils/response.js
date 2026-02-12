export const response = (result) => {
  if (result.error) {
    return {
      status: 'error',
      code: result.code,
      message: result.error ?? null,
      data: null
    }
  } else {
    return {
      status: 'success',
      code: result.code,
      message: result.message ?? null,
      data: result.data ?? null,
      meta: result.meta ?? undefined
    }
  }
}

export function SuccessRes (res, result) {
  res.status(result.code).json(response(result))
}

export function ErrorRes (res, result) {
  res.status(result.code).json(response(result))
}
